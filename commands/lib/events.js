import { config } from '../config/config.js';
import { getGroupSettings, getBotSettings } from './store.js';
import { badWords } from '../config/config.js';

// ─── Welcome new members ─────────────────────────────────────────
export async function handleGroupJoin(sock, event) {
  for (const e of event) {
    if (e.action !== 'add') continue;
    const jid = e.id;
    const settings = getGroupSettings(jid);
    if (!settings.welcome) continue;
    try {
      const meta = await sock.groupMetadata(jid);
      for (const participant of e.participants) {
        await sock.sendMessage(jid, {
          text: `🎉 *Welcome to ${meta.subject}!*\n\n👋 Hey @${participant.replace('@s.whatsapp.net', '')}, welcome to the group!\n\nPlease read the group rules and enjoy your stay 🙏`,
          mentions: [participant]
        });
      }
    } catch {}
  }
}

// ─── Goodbye leaving members ─────────────────────────────────────
export async function handleGroupLeave(sock, event) {
  for (const e of event) {
    if (e.action !== 'remove') continue;
    const jid = e.id;
    const settings = getGroupSettings(jid);
    if (!settings.goodbye) continue;
    try {
      const meta = await sock.groupMetadata(jid);
      for (const participant of e.participants) {
        await sock.sendMessage(jid, {
          text: `😢 *Goodbye!*\n\n@${participant.replace('@s.whatsapp.net', '')} has left ${meta.subject}. We'll miss you! 👋`,
          mentions: [participant]
        });
      }
    } catch {}
  }
}

// ─── Anti-link detection ─────────────────────────────────────────
const linkRegex = /https?:\/\/(www\.)?(chat\.whatsapp\.com|t\.me|telegram\.me|discord\.gg|bit\.ly|tinyurl\.com|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]+)/gi;

export async function handleAntiLink(sock, msg, { jid, sender, isGroup }) {
  if (!isGroup) return false;
  const settings = getGroupSettings(jid);
  if (!settings.antiLink) return false;
  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  if (!linkRegex.test(body)) return false;
  // Check if sender is admin
  const { isAdmin } = await import('./utils.js');
  if (await isAdmin(sock, jid, sender)) return false;
  await sock.sendMessage(jid, {
    delete: msg.key
  });
  await sock.sendMessage(jid, {
    text: `⚠️ @${sender.replace('@s.whatsapp.net', '')} Links are *not allowed* in this group!`,
    mentions: [sender]
  });
  return true;
}

// ─── Anti-bad word ───────────────────────────────────────────────
export async function handleAntiBadWord(sock, msg, { jid, sender, isGroup }) {
  if (!isGroup) return false;
  const settings = getGroupSettings(jid);
  if (!settings.antiBadWord) return false;
  const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').toLowerCase();
  const found = badWords.some(w => body.includes(w.toLowerCase()));
  if (!found) return false;
  const { isAdmin } = await import('./utils.js');
  if (await isAdmin(sock, jid, sender)) return false;
  await sock.sendMessage(jid, { delete: msg.key });
  await sock.sendMessage(jid, {
    text: `🤬 @${sender.replace('@s.whatsapp.net', '')} *Bad language is not allowed!*`,
    mentions: [sender]
  });
  return true;
}

// ─── Anti-delete ─────────────────────────────────────────────────
const msgStore = new Map();

export function storeMessage(msg) {
  const botSettings = getBotSettings();
  if (!botSettings.antiDelete) return;
  msgStore.set(msg.key.id, msg);
  // Keep only last 100 messages
  if (msgStore.size > 100) {
    const firstKey = msgStore.keys().next().value;
    msgStore.delete(firstKey);
  }
}

export async function handleAntiDelete(sock, event) {
  const botSettings = getBotSettings();
  if (!botSettings.antiDelete) return;
  for (const item of event) {
    if (!item.key?.id) continue;
    const stored = msgStore.get(item.key.id);
    if (!stored) continue;
    const jid = item.key.remoteJid;
    const body = stored.message?.conversation || stored.message?.extendedTextMessage?.text;
    if (!body) continue;
    await sock.sendMessage(jid, {
      text: `🗑️ *Deleted Message Detected!*\n\nFrom: @${(item.key.participant || item.key.remoteJid).replace('@s.whatsapp.net', '')}\nContent: ${body}`,
      mentions: [item.key.participant || item.key.remoteJid]
    });
  }
}

// ─── Auto-read ───────────────────────────────────────────────────
export async function handleAutoRead(sock, msg) {
  const botSettings = getBotSettings();
  if (!botSettings.autoRead) return;
  await sock.readMessages([msg.key]);
}

// ─── Auto-typing ─────────────────────────────────────────────────
export async function handleAutoTyping(sock, jid) {
  const botSettings = getBotSettings();
  if (!botSettings.autoTyping) return;
  await sock.sendPresenceUpdate('composing', jid);
}

// ─── Anti-call ───────────────────────────────────────────────────
export async function handleAntiCall(sock, call) {
  const botSettings = getBotSettings();
  if (!botSettings.antiCall) return;
  if (call[0].status === 'offer') {
    await sock.rejectCall(call[0].id, call[0].from);
    await sock.sendMessage(call[0].from, {
      text: '⛔ Sorry, I don\'t accept calls. Please send a message instead!'
    });
  }
}

// ─── PM Blocker ──────────────────────────────────────────────────
export async function handlePMBlocker(sock, msg, { isGroup, sender, isOwner }) {
  if (isGroup || isOwner) return false;
  const botSettings = getBotSettings();
  if (!botSettings.pmBlocker) return false;
  await sock.sendMessage(msg.key.remoteJid, { text: botSettings.pmBlockerMsg });
  return true;
}

// ─── Chatbot ─────────────────────────────────────────────────────
export async function handleChatbot(sock, msg, { jid, isGroup, body }) {
  if (!body || body.startsWith(config.prefix)) return false;
  if (isGroup) {
    const settings = getGroupSettings(jid);
    if (!settings.chatbot) return false;
  }
  const globalBot = getBotSettings();
  if (!isGroup && !globalBot.chatbot) return false;
  try {
    const axios = (await import('axios')).default;
    const res = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(body)}`);
    await sock.sendMessage(jid, { text: res.data }, { quoted: msg });
    return true;
  } catch { return false; }
}
