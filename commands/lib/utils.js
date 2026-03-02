import axios from 'axios';
import { config } from '../config/config.js';

// ─── Reply helpers ───────────────────────────────────────────────

export async function reply(sock, msg, text) {
  return sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
}

export async function react(sock, msg, emoji) {
  return sock.sendMessage(msg.key.remoteJid, {
    react: { text: emoji, key: msg.key }
  });
}

export async function sendImage(sock, jid, buffer, caption = '', quoted = null) {
  const opts = { image: buffer, caption };
  return sock.sendMessage(jid, opts, quoted ? { quoted } : {});
}

export async function sendVideo(sock, jid, buffer, caption = '', quoted = null) {
  const opts = { video: buffer, caption };
  return sock.sendMessage(jid, opts, quoted ? { quoted } : {});
}

export async function sendAudio(sock, jid, buffer, quoted = null) {
  return sock.sendMessage(jid, { audio: buffer, mimetype: 'audio/mpeg' }, quoted ? { quoted } : {});
}

export async function sendSticker(sock, jid, buffer, quoted = null) {
  return sock.sendMessage(jid, { sticker: buffer }, quoted ? { quoted } : {});
}

// ─── Message parsing ─────────────────────────────────────────────

export function getMsgInfo(msg) {
  const jid = msg.key.remoteJid;
  const isGroup = jid.endsWith('@g.us');
  const sender = isGroup
    ? msg.key.participant || msg.participant
    : msg.key.remoteJid;
  const pushName = msg.pushName || 'User';
  const isOwner = sender?.replace(/[^0-9]/g, '') === config.ownerNumber.replace(/[^0-9]/g, '');
  const body = msg.message?.conversation
    || msg.message?.extendedTextMessage?.text
    || msg.message?.imageMessage?.caption
    || msg.message?.videoMessage?.caption
    || '';
  const isCmd = body.startsWith(config.prefix);
  const command = isCmd ? body.slice(config.prefix.length).split(' ')[0].toLowerCase() : '';
  const args = isCmd ? body.slice(config.prefix.length + command.length).trim().split(' ') : [];
  const text = args.join(' ').trim();
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  return { jid, isGroup, sender, pushName, isOwner, body, isCmd, command, args, text, quoted, mentionedJid };
}

export function getMediaType(msg) {
  const m = msg.message;
  if (!m) return null;
  if (m.imageMessage) return 'image';
  if (m.videoMessage) return 'video';
  if (m.stickerMessage) return 'sticker';
  if (m.audioMessage) return 'audio';
  if (m.documentMessage) return 'document';
  return null;
}

// ─── Group helpers ───────────────────────────────────────────────

export async function isAdmin(sock, jid, sender) {
  try {
    const meta = await sock.groupMetadata(jid);
    return meta.participants.some(p =>
      p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    );
  } catch { return false; }
}

export async function isBotAdmin(sock, jid) {
  try {
    const meta = await sock.groupMetadata(jid);
    const botJid = sock.user.id.replace(/:\d+@/, '@');
    return meta.participants.some(p =>
      p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin')
    );
  } catch { return false; }
}

// ─── Formatting ──────────────────────────────────────────────────

export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function runtime(start) {
  const diff = Date.now() - start;
  const s = Math.floor(diff / 1000) % 60;
  const m = Math.floor(diff / 60000) % 60;
  const h = Math.floor(diff / 3600000);
  return `${h}h ${m}m ${s}s`;
}

// ─── HTTP helpers ────────────────────────────────────────────────

export async function fetchBuffer(url, options = {}) {
  const res = await axios.get(url, { responseType: 'arraybuffer', ...options });
  return Buffer.from(res.data);
}

export async function fetchJson(url, options = {}) {
  const res = await axios.get(url, options);
  return res.data;
}
