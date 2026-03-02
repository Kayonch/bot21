import { reply, fetchBuffer, sendSticker, sendImage } from '../lib/utils.js';
import { config } from '../config/config.js';
import axios from 'axios';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

// ─── Sticker (image → sticker) ───────────────────────────────────
export async function stickerCommand(sock, msg, { jid }) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
  const vidMsg = quoted?.videoMessage || msg.message?.videoMessage;
  if (!imgMsg && !vidMsg) return reply(sock, msg, '❓ Reply to or send an image/video!');
  await reply(sock, msg, '🔄 Converting to sticker...');
  try {
    let buffer;
    if (imgMsg) {
      buffer = await downloadMediaMessage({ message: { imageMessage: imgMsg } }, 'buffer', {});
    } else {
      buffer = await downloadMediaMessage({ message: { videoMessage: vidMsg } }, 'buffer', {});
    }
    await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Failed to create sticker.');
  }
}

// ─── Sticker → Image ─────────────────────────────────────────────
export async function simageCommand(sock, msg, { jid }) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const stickerMsg = quoted?.stickerMessage || msg.message?.stickerMessage;
  if (!stickerMsg) return reply(sock, msg, '❓ Reply to a sticker!');
  try {
    const buffer = await downloadMediaMessage({ message: { stickerMessage: stickerMsg } }, 'buffer', {});
    await sock.sendMessage(jid, { image: buffer }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Failed to convert sticker.');
  }
}

// ─── Blur ────────────────────────────────────────────────────────
export async function blurCommand(sock, msg, { jid }) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
  if (!imgMsg) return reply(sock, msg, '❓ Reply to or send an image!');
  await reply(sock, msg, '🔄 Blurring image...');
  try {
    const buffer = await downloadMediaMessage({ message: { imageMessage: imgMsg } }, 'buffer', {});
    const { default: Jimp } = await import('jimp');
    const img = await Jimp.read(buffer);
    img.blur(15);
    const blurred = await img.getBufferAsync(Jimp.MIME_JPEG);
    await sock.sendMessage(jid, { image: blurred, caption: '🌫️ Blurred!' }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Blur failed. Make sure jimp is installed.');
  }
}

// ─── Remove BG ───────────────────────────────────────────────────
export async function removeBGCommand(sock, msg, { jid }) {
  if (!config.removebgKey) return reply(sock, msg, '⚠️ Remove.bg API key not configured!');
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
  if (!imgMsg) return reply(sock, msg, '❓ Reply to or send an image!');
  await reply(sock, msg, '🔄 Removing background...');
  try {
    const buffer = await downloadMediaMessage({ message: { imageMessage: imgMsg } }, 'buffer', {});
    const form = new FormData();
    form.append('image_file', buffer, 'image.jpg');
    form.append('size', 'auto');
    const res = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
      headers: { 'X-Api-Key': config.removebgKey },
      responseType: 'arraybuffer'
    });
    await sock.sendMessage(jid, { image: Buffer.from(res.data), caption: '✅ Background removed!' }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Remove BG failed. Check your API key.');
  }
}

// ─── Meme ────────────────────────────────────────────────────────
export async function memeCommand(sock, msg, { jid }) {
  try {
    const res = await axios.get('https://meme-api.com/gimme');
    const { title, url } = res.data;
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(jid, { image: buffer, caption: `😂 ${title}` }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Could not fetch meme.');
  }
}

// ─── Emoji Mix ───────────────────────────────────────────────────
export async function emojiMixCommand(sock, msg, { jid, text }) {
  if (!text || !text.includes('+')) return reply(sock, msg, `❓ Usage: ${config.prefix}emojimix 😂+😭`);
  const [e1, e2] = text.split('+').map(e => e.trim());
  const encode = (emoji) => [...emoji].map(c => c.codePointAt(0).toString(16)).join('-');
  const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/${encode(e1)}/${encode(e1)}_${encode(e2)}.png`;
  try {
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(jid, { image: buffer, caption: `${e1} + ${e2}` }, { quoted: msg });
  } catch {
    return reply(sock, msg, `❌ Emoji mix not available for ${e1} + ${e2}`);
  }
}

// ─── Screenshot ──────────────────────────────────────────────────
export async function screenshotCommand(sock, msg, { text, jid }) {
  if (!text || !text.startsWith('http')) return reply(sock, msg, `❓ Usage: ${config.prefix}ss <url>`);
  await reply(sock, msg, '📸 Taking screenshot...');
  try {
    const url = `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(text)}&device=desktop&dimension=1366x768`;
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(jid, { image: buffer, caption: `📸 Screenshot of ${text}` }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Screenshot failed.');
  }
}

// ─── Anime commands ──────────────────────────────────────────────
const animeEndpoints = {
  neko: 'https://nekos.best/api/v2/neko',
  waifu: 'https://nekos.best/api/v2/waifu',
  nom: 'https://nekos.best/api/v2/nom',
  poke: 'https://nekos.best/api/v2/poke',
  cry: 'https://nekos.best/api/v2/cry',
  kiss: 'https://nekos.best/api/v2/kiss',
  pat: 'https://nekos.best/api/v2/pat',
  hug: 'https://nekos.best/api/v2/hug',
  wink: 'https://nekos.best/api/v2/wink',
  facepalm: 'https://nekos.best/api/v2/facepalm',
};

async function animeCmd(sock, msg, jid, type) {
  try {
    const res = await axios.get(animeEndpoints[type]);
    const url = res.data.results?.[0]?.url;
    if (!url) throw new Error();
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(jid, { image: buffer, caption: `🌸 ${type}` }, { quoted: msg });
  } catch {
    reply(sock, msg, `❌ Could not fetch ${type} image.`);
  }
}

export const nekoCommand = (s, m, p) => animeCmd(s, m, p.jid, 'neko');
export const waifuCommand = (s, m, p) => animeCmd(s, m, p.jid, 'waifu');
export const nomCommand = (s, m, p) => animeCmd(s, m, p.jid, 'nom');
export const pokeCommand = (s, m, p) => animeCmd(s, m, p.jid, 'poke');
export const cryCommand = (s, m, p) => animeCmd(s, m, p.jid, 'cry');
export const kissCommand = (s, m, p) => animeCmd(s, m, p.jid, 'kiss');
export const patCommand = (s, m, p) => animeCmd(s, m, p.jid, 'pat');
export const hugCommand = (s, m, p) => animeCmd(s, m, p.jid, 'hug');
export const winkCommand = (s, m, p) => animeCmd(s, m, p.jid, 'wink');
export const facepalmCommand = (s, m, p) => animeCmd(s, m, p.jid, 'facepalm');

// ─── Loli (placeholder — not NSFW) ──────────────────────────────
export const loliCommand = nekoCommand;

// ─── Misc picture commands ───────────────────────────────────────
async function fetchAndSend(sock, msg, jid, url, caption) {
  try {
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(jid, { image: buffer, caption }, { quoted: msg });
  } catch {
    reply(sock, msg, '❌ Failed to fetch image.');
  }
}

export const heartCommand = (s, m, p) => fetchAndSend(s, m, p.jid, 'https://picsum.photos/seed/heart/400/400', '❤️ Heart');
export const circleCommand = (s, m, p) => fetchAndSend(s, m, p.jid, 'https://picsum.photos/seed/circle/400/400', '⭕ Circle');

// ─── GitHub commands ─────────────────────────────────────────────
export async function githubCommand(sock, msg, { text }) {
  const user = text || 'Lucky218';
  try {
    const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(user)}`);
    const d = res.data;
    return reply(sock, msg,
`💻 *GitHub: ${d.login}*

📛 Name: ${d.name || 'N/A'}
📝 Bio: ${d.bio || 'N/A'}
📁 Public Repos: ${d.public_repos}
👥 Followers: ${d.followers}
➡️ Following: ${d.following}
🔗 Profile: ${d.html_url}`
    );
  } catch {
    return reply(sock, msg, `❌ GitHub user "*${user}*" not found.`);
  }
}

export async function scriptCommand(sock, msg) {
  return reply(sock, msg,
`💻 *LTH Bot Script*

🔗 GitHub: https://github.com/Lucky218/lth-bot
📺 YouTube: Lucky Tech Hub
🇺🇬 Made in Uganda

Star the repo if you like it! ⭐`
  );
}

// ─── VV (view once media resend) ─────────────────────────────────
export async function vvCommand(sock, msg, { jid }) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  const qMsg = ctx?.quotedMessage;
  if (!qMsg) return reply(sock, msg, '❓ Reply to a view-once message!');
  const viewOnce = qMsg?.viewOnceMessage?.message || qMsg?.viewOnceMessageV2?.message;
  if (!viewOnce) return reply(sock, msg, '❌ No view-once message found!');
  const imgMsg = viewOnce.imageMessage;
  const vidMsg = viewOnce.videoMessage;
  try {
    if (imgMsg) {
      const buffer = await downloadMediaMessage({ message: { imageMessage: imgMsg } }, 'buffer', {});
      await sock.sendMessage(jid, { image: buffer, caption: '👁️ View Once revealed!' }, { quoted: msg });
    } else if (vidMsg) {
      const buffer = await downloadMediaMessage({ message: { videoMessage: vidMsg } }, 'buffer', {});
      await sock.sendMessage(jid, { video: buffer, caption: '👁️ View Once revealed!' }, { quoted: msg });
    }
  } catch {
    return reply(sock, msg, '❌ Could not reveal view-once media.');
  }
}
