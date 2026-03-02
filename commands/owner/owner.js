import { reply } from '../lib/utils.js';
import { config } from '../config/config.js';
import { getBotSettings, setBotSetting, blockUser, unblockUser, isBlocked, getBlockedList } from '../lib/store.js';
import fs from 'fs';

function onlyOwner(sock, msg, isOwner) {
  if (!isOwner) {
    reply(sock, msg, '🔒 This command is for the *owner only*!');
    return false;
  }
  return true;
}

// ─── Mode ────────────────────────────────────────────────────────
export async function modeCommand(sock, msg, { isOwner, args }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  const mode = args[0]?.toLowerCase();
  if (!['public', 'private'].includes(mode)) {
    return reply(sock, msg, `❓ Usage: ${config.prefix}mode <public|private>\n\nCurrent mode: *${config.mode}*`);
  }
  config.mode = mode;
  return reply(sock, msg, `✅ Bot mode set to *${mode}*`);
}

// ─── Block / Unblock ─────────────────────────────────────────────
export async function blockCommand(sock, msg, { isOwner, mentionedJid }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  if (!mentionedJid.length) return reply(sock, msg, `❓ Usage: ${config.prefix}block @user`);
  for (const user of mentionedJid) {
    blockUser(user);
    await sock.updateBlockStatus(user, 'block');
  }
  return reply(sock, msg, `✅ Blocked ${mentionedJid.length} user(s)`);
}

export async function unblockCommand(sock, msg, { isOwner, mentionedJid }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  if (!mentionedJid.length) return reply(sock, msg, `❓ Usage: ${config.prefix}unblock @user`);
  for (const user of mentionedJid) {
    unblockUser(user);
    await sock.updateBlockStatus(user, 'unblock');
  }
  return reply(sock, msg, `✅ Unblocked ${mentionedJid.length} user(s)`);
}

export async function blockListCommand(sock, msg, { isOwner }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  const list = getBlockedList();
  if (!list.length) return reply(sock, msg, '📋 No blocked users.');
  const text = list.map((j, i) => `${i + 1}. ${j.replace('@s.whatsapp.net', '')}`).join('\n');
  return reply(sock, msg, `🚫 *Blocked Users (${list.length})*\n\n${text}`);
}

// ─── Settings ────────────────────────────────────────────────────
export async function settingsCommand(sock, msg, { isOwner }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  const s = getBotSettings();
  return reply(sock, msg,
`⚙️ *Bot Settings*

🌍 Mode: *${config.mode}*
📷 Auto Status: *${s.autoStatus ? 'ON' : 'OFF'}*
⌨️ Auto Typing: *${s.autoTyping ? 'ON' : 'OFF'}*
🎤 Auto Recording: *${s.autoRecording ? 'ON' : 'OFF'}*
👁️ Auto Read: *${s.autoRead ? 'ON' : 'OFF'}*
📞 Anti Call: *${s.antiCall ? 'ON' : 'OFF'}*
🗑️ Anti Delete: *${s.antiDelete ? 'ON' : 'OFF'}*
🚫 PM Blocker: *${s.pmBlocker ? 'ON' : 'OFF'}*`
  );
}

// ─── Auto features ───────────────────────────────────────────────
function makeToggleCommand(key, label) {
  return async function(sock, msg, { isOwner, args }) {
    if (!onlyOwner(sock, msg, isOwner)) return;
    const on = args[0] !== 'off';
    setBotSetting(key, on);
    return reply(sock, msg, `${label}: *${on ? 'ON ✅' : 'OFF ❌'}*`);
  };
}

export const autoStatusCommand = makeToggleCommand('autoStatus', '📷 Auto Status');
export const autoTypingCommand = makeToggleCommand('autoTyping', '⌨️ Auto Typing');
export const autoRecordingCommand = makeToggleCommand('autoRecording', '🎤 Auto Recording');
export const autoReadCommand = makeToggleCommand('autoRead', '👁️ Auto Read');
export const antiCallCommand = makeToggleCommand('antiCall', '📞 Anti Call');
export const antiDeleteCommand = makeToggleCommand('antiDelete', '🗑️ Anti Delete');

// ─── PM Blocker ──────────────────────────────────────────────────
export async function pmBlockerCommand(sock, msg, { isOwner, args }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  const sub = args[0]?.toLowerCase();
  if (sub === 'setmsg') {
    const text = args.slice(1).join(' ');
    if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}pmblocker setmsg <message>`);
    setBotSetting('pmBlockerMsg', text);
    return reply(sock, msg, `✅ PM blocker message set!`);
  }
  if (sub === 'status') {
    const s = getBotSettings();
    return reply(sock, msg, `PM Blocker: *${s.pmBlocker ? 'ON' : 'OFF'}*\nMessage: ${s.pmBlockerMsg}`);
  }
  const on = sub !== 'off';
  setBotSetting('pmBlocker', on);
  return reply(sock, msg, `🚫 PM Blocker: *${on ? 'ON' : 'OFF'}*`);
}

// ─── Set Bot PP ──────────────────────────────────────────────────
export async function setBotPPCommand(sock, msg, { isOwner }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
  if (!imgMsg) return reply(sock, msg, '❓ Reply to or send an image!');
  try {
    const { downloadMediaMessage } = await import('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage({ message: { imageMessage: imgMsg } }, 'buffer', {});
    await sock.updateProfilePicture(sock.user.id, buffer);
    return reply(sock, msg, '✅ Bot profile picture updated!');
  } catch {
    return reply(sock, msg, '❌ Failed to update profile picture.');
  }
}

// ─── Clear session / tmp ─────────────────────────────────────────
export async function clearSessionCommand(sock, msg, { isOwner }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  return reply(sock, msg, '⚠️ Please restart the bot manually to clear the session.');
}

export async function clearTmpCommand(sock, msg, { isOwner }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  try {
    const files = fs.readdirSync('/tmp').filter(f => f.startsWith('lth_'));
    files.forEach(f => fs.unlinkSync(`/tmp/${f}`));
    return reply(sock, msg, `🗑️ Cleared ${files.length} temp files`);
  } catch {
    return reply(sock, msg, '✅ Temp cleared (or nothing to clear)');
  }
}

// ─── Update ──────────────────────────────────────────────────────
export async function updateCommand(sock, msg, { isOwner }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  return reply(sock, msg,
`🔄 *Update Info*

Current Version: *${config.version}*

To update:
\`\`\`
git pull
npm install
\`\`\`
Then restart the bot.`
  );
}

// ─── Auto status delay ───────────────────────────────────────────
export async function autoStatusDelayCommand(sock, msg, { isOwner, args }) {
  if (!onlyOwner(sock, msg, isOwner)) return;
  const ms = parseInt(args[0]) * 1000;
  if (isNaN(ms)) return reply(sock, msg, `❓ Usage: ${config.prefix}autostatus delay <seconds>`);
  setBotSetting('statusDelay', ms);
  return reply(sock, msg, `⏱️ Auto status delay set to *${args[0]}s*`);
}
