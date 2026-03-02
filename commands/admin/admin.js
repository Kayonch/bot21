import { reply, isAdmin, isBotAdmin } from '../lib/utils.js';
import { config } from '../config/config.js';
import { addWarning, getWarnings, clearWarnings, setGroupSetting, getGroupSettings } from '../lib/store.js';

// ─── Guard helper ────────────────────────────────────────────────
async function requireAdmin(sock, msg, jid, sender) {
  if (!(await isAdmin(sock, jid, sender))) {
    await reply(sock, msg, '❌ This command is for *admins only*!');
    return false;
  }
  return true;
}

async function requireBotAdmin(sock, msg, jid) {
  if (!(await isBotAdmin(sock, jid))) {
    await reply(sock, msg, '⚠️ Please make me an admin first!');
    return false;
  }
  return true;
}

// ─── Ban ─────────────────────────────────────────────────────────
export async function banCommand(sock, msg, { jid, sender, isGroup, mentionedJid }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  if (!mentionedJid.length) return reply(sock, msg, `❓ Usage: ${config.prefix}ban @user`);
  for (const user of mentionedJid) {
    await sock.groupParticipantsUpdate(jid, [user], 'remove');
  }
  return reply(sock, msg, `✅ Banned ${mentionedJid.length} user(s)`);
}

// ─── Kick ────────────────────────────────────────────────────────
export async function kickCommand(sock, msg, { jid, sender, isGroup, mentionedJid }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  if (!mentionedJid.length) return reply(sock, msg, `❓ Usage: ${config.prefix}kick @user`);
  for (const user of mentionedJid) {
    await sock.groupParticipantsUpdate(jid, [user], 'remove');
  }
  return reply(sock, msg, `✅ Kicked ${mentionedJid.length} user(s)`);
}

// ─── Promote ─────────────────────────────────────────────────────
export async function promoteCommand(sock, msg, { jid, sender, isGroup, mentionedJid }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  if (!mentionedJid.length) return reply(sock, msg, `❓ Usage: ${config.prefix}promote @user`);
  await sock.groupParticipantsUpdate(jid, mentionedJid, 'promote');
  return reply(sock, msg, `✅ Promoted ${mentionedJid.map(j => '@' + j.replace('@s.whatsapp.net', '')).join(', ')} to admin`);
}

// ─── Demote ──────────────────────────────────────────────────────
export async function demoteCommand(sock, msg, { jid, sender, isGroup, mentionedJid }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  if (!mentionedJid.length) return reply(sock, msg, `❓ Usage: ${config.prefix}demote @user`);
  await sock.groupParticipantsUpdate(jid, mentionedJid, 'demote');
  return reply(sock, msg, `✅ Demoted successfully`);
}

// ─── Mute / Unmute ───────────────────────────────────────────────
export async function muteCommand(sock, msg, { jid, sender, isGroup, args }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  const minutes = parseInt(args[0]) || 60;
  const settings = getGroupSettings(jid);
  settings.muted = true;
  settings.muteUntil = Date.now() + minutes * 60 * 1000;
  await sock.groupSettingUpdate(jid, 'announcement');
  return reply(sock, msg, `🔇 Group muted for *${minutes} minutes*`);
}

export async function unmuteCommand(sock, msg, { jid, sender, isGroup }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  const settings = getGroupSettings(jid);
  settings.muted = false;
  settings.muteUntil = null;
  await sock.groupSettingUpdate(jid, 'not_announcement');
  return reply(sock, msg, '🔊 Group *unmuted*!');
}

// ─── Delete ──────────────────────────────────────────────────────
export async function deleteCommand(sock, msg, { jid, sender, isGroup }) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  if (!quoted?.quotedMessage) return reply(sock, msg, '❓ Reply to a message to delete it.');
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  const key = {
    remoteJid: jid,
    fromMe: false,
    id: quoted.stanzaId,
    participant: quoted.participant
  };
  await sock.sendMessage(jid, { delete: key });
}

// ─── Warn ────────────────────────────────────────────────────────
export async function warnCommand(sock, msg, { jid, sender, isGroup, mentionedJid }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!mentionedJid.length) return reply(sock, msg, `❓ Usage: ${config.prefix}warn @user`);
  for (const user of mentionedJid) {
    const warns = addWarning(jid, user);
    await sock.sendMessage(jid, {
      text: `⚠️ @${user.replace('@s.whatsapp.net', '')} has been warned!\n\n⚠️ Warning count: *${warns}/3*${warns >= 3 ? '\n\n🔨 Max warnings reached!' : ''}`,
      mentions: [user]
    });
    if (warns >= 3) {
      if (await isBotAdmin(sock, jid)) {
        await sock.groupParticipantsUpdate(jid, [user], 'remove');
        clearWarnings(jid, user);
      }
    }
  }
}

export async function warningsCommand(sock, msg, { jid, isGroup, mentionedJid }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!mentionedJid.length) return reply(sock, msg, `❓ Usage: ${config.prefix}warnings @user`);
  const user = mentionedJid[0];
  const warns = getWarnings(jid, user);
  return sock.sendMessage(jid, {
    text: `📊 @${user.replace('@s.whatsapp.net', '')} has *${warns}/3* warnings`,
    mentions: [user]
  }, { quoted: msg });
}

// ─── Tag / Tagall ────────────────────────────────────────────────
export async function tagCommand(sock, msg, { jid, sender, isGroup, text }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const meta = await sock.groupMetadata(jid);
  const mentions = meta.participants.map(p => p.id);
  return sock.sendMessage(jid, {
    text: text || '📢 Attention!',
    mentions
  }, { quoted: msg });
}

export async function tagAllCommand(sock, msg, { jid, sender, isGroup, text }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const meta = await sock.groupMetadata(jid);
  const mentions = meta.participants.map(p => p.id);
  let body = (text || '📢 *Attention everyone!*') + '\n\n';
  mentions.forEach(j => { body += `@${j.replace('@s.whatsapp.net', '')} `; });
  return sock.sendMessage(jid, { text: body, mentions }, { quoted: msg });
}

export async function tagNotAdminCommand(sock, msg, { jid, sender, isGroup, text }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const meta = await sock.groupMetadata(jid);
  const nonAdmins = meta.participants.filter(p => !p.admin);
  const mentions = nonAdmins.map(p => p.id);
  let body = (text || '📢 *Attention members!*') + '\n\n';
  mentions.forEach(j => { body += `@${j.replace('@s.whatsapp.net', '')} `; });
  return sock.sendMessage(jid, { text: body, mentions }, { quoted: msg });
}

export async function hideTagCommand(sock, msg, { jid, sender, isGroup, text }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const meta = await sock.groupMetadata(jid);
  const mentions = meta.participants.map(p => p.id);
  return sock.sendMessage(jid, {
    text: text || '.',
    mentions
  });
}

// ─── Antilink ────────────────────────────────────────────────────
export async function antilinkCommand(sock, msg, { jid, sender, isGroup, args }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const on = args[0] !== 'off';
  setGroupSetting(jid, 'antiLink', on);
  return reply(sock, msg, `🔗 Anti-link: *${on ? 'ON' : 'OFF'}*`);
}

// ─── Anti bad word ───────────────────────────────────────────────
export async function antibadwordCommand(sock, msg, { jid, sender, isGroup, args }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const on = args[0] !== 'off';
  setGroupSetting(jid, 'antiBadWord', on);
  return reply(sock, msg, `🤬 Anti-bad word: *${on ? 'ON' : 'OFF'}*`);
}

// ─── Welcome / Goodbye ───────────────────────────────────────────
export async function welcomeCommand(sock, msg, { jid, sender, isGroup, args }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const on = args[0] !== 'off';
  setGroupSetting(jid, 'welcome', on);
  return reply(sock, msg, `👋 Welcome messages: *${on ? 'ON' : 'OFF'}*`);
}

export async function goodbyeCommand(sock, msg, { jid, sender, isGroup, args }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const on = args[0] !== 'off';
  setGroupSetting(jid, 'goodbye', on);
  return reply(sock, msg, `👋 Goodbye messages: *${on ? 'ON' : 'OFF'}*`);
}

// ─── Chatbot ─────────────────────────────────────────────────────
export async function chatbotCommand(sock, msg, { jid, sender, isGroup, args }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const on = args[0] !== 'off';
  setGroupSetting(jid, 'chatbot', on);
  return reply(sock, msg, `🤖 Chatbot: *${on ? 'ON' : 'OFF'}*`);
}

// ─── Reset group link ────────────────────────────────────────────
export async function resetLinkCommand(sock, msg, { jid, sender, isGroup }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  await sock.groupRevokeInvite(jid);
  const code = await sock.groupInviteCode(jid);
  return reply(sock, msg, `✅ Group link reset!\n\nNew link: https://chat.whatsapp.com/${code}`);
}

// ─── Anti-tag ────────────────────────────────────────────────────
export async function antiTagCommand(sock, msg, { jid, sender, isGroup, args }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  const on = args[0] !== 'off';
  setGroupSetting(jid, 'antiTag', on);
  return reply(sock, msg, `🏷️ Anti-tag: *${on ? 'ON' : 'OFF'}*`);
}

// ─── Set Group Name ──────────────────────────────────────────────
export async function setGroupNameCommand(sock, msg, { jid, sender, isGroup, text }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}setgname <new name>`);
  await sock.groupUpdateSubject(jid, text);
  return reply(sock, msg, `✅ Group name changed to *${text}*`);
}

// ─── Set Group Desc ──────────────────────────────────────────────
export async function setGroupDescCommand(sock, msg, { jid, sender, isGroup, text }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}setgdesc <description>`);
  await sock.groupUpdateDescription(jid, text);
  return reply(sock, msg, `✅ Group description updated!`);
}

// ─── Set Group PP ────────────────────────────────────────────────
export async function setGroupPPCommand(sock, msg, { jid, sender, isGroup }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  if (!(await requireBotAdmin(sock, msg, jid))) return;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
  if (!imgMsg) return reply(sock, msg, '❓ Reply to an image or send with caption');
  const { downloadMediaMessage } = await import('@whiskeysockets/baileys');
  const buffer = await downloadMediaMessage({ message: { imageMessage: imgMsg } }, 'buffer', {});
  await sock.updateProfilePicture(jid, buffer);
  return reply(sock, msg, '✅ Group photo updated!');
}

// ─── Clear ───────────────────────────────────────────────────────
export async function clearCommand(sock, msg, { jid, sender, isGroup }) {
  if (!isGroup) return reply(sock, msg, '❌ Group only!');
  if (!(await requireAdmin(sock, msg, jid, sender))) return;
  return reply(sock, msg, '🧹 *Chat cleared!* (Note: This clears bot messages — manual clearing needed on WhatsApp)');
}
