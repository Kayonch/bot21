import { reply, fetchBuffer, sendImage } from '../lib/utils.js';
import { config } from '../config/config.js';
import axios from 'axios';

// Uses textpro.me or flamingtext style APIs
async function textEffect(sock, msg, jid, effect, text) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}${effect} <text>`);
  await reply(sock, msg, '🎨 Generating text effect...');
  try {
    const url = `https://api.lolhuman.xyz/api/teks/${effect}?apikey=tes&text=${encodeURIComponent(text)}`;
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(jid, { image: buffer, caption: `✨ ${effect.toUpperCase()}: ${text}` }, { quoted: msg });
  } catch {
    // Fallback: use a simple text art generator
    const arts = {
      fire: `🔥 ${text} 🔥`,
      ice: `❄️ ${text} ❄️`,
      neon: `💡 ${text} 💡`,
      matrix: `🟢 ${text} 🟢`,
      glitch: `⚡ ${text.split('').join('̴')} ⚡`,
      devil: `😈 ${text} 😈`,
      snow: `⛄ ${text} ⛄`,
      hacker: `💻 ${text} 💻`,
      thunder: `⚡ ${text} ⚡`,
      metallic: `🔧 ${text} 🔧`,
      sand: `🏖️ ${text} 🏖️`,
      purple: `💜 ${text} 💜`,
      light: `✨ ${text} ✨`,
      leaves: `🍃 ${text} 🍃`,
      arena: `🏟️ ${text} 🏟️`,
      impressive: `🌟 ${text} 🌟`,
      blackpink: `🖤💗 ${text} 💗🖤`,
      '1917': `🪖 ${text} 🪖`,
    };
    return reply(sock, msg, arts[effect] || `✨ ${text}`);
  }
}

export const metallicCommand = (s, m, p) => textEffect(s, m, p.jid, 'metallic', p.text);
export const iceCommand = (s, m, p) => textEffect(s, m, p.jid, 'ice', p.text);
export const snowCommand = (s, m, p) => textEffect(s, m, p.jid, 'snow', p.text);
export const impressiveCommand = (s, m, p) => textEffect(s, m, p.jid, 'impressive', p.text);
export const matrixCommand = (s, m, p) => textEffect(s, m, p.jid, 'matrix', p.text);
export const lightCommand = (s, m, p) => textEffect(s, m, p.jid, 'light', p.text);
export const neonCommand = (s, m, p) => textEffect(s, m, p.jid, 'neon', p.text);
export const devilCommand = (s, m, p) => textEffect(s, m, p.jid, 'devil', p.text);
export const purpleCommand = (s, m, p) => textEffect(s, m, p.jid, 'purple', p.text);
export const thunderCommand = (s, m, p) => textEffect(s, m, p.jid, 'thunder', p.text);
export const leavesCommand = (s, m, p) => textEffect(s, m, p.jid, 'leaves', p.text);
export const year1917Command = (s, m, p) => textEffect(s, m, p.jid, '1917', p.text);
export const arenaCommand = (s, m, p) => textEffect(s, m, p.jid, 'arena', p.text);
export const hackerCommand = (s, m, p) => textEffect(s, m, p.jid, 'hacker', p.text);
export const sandCommand = (s, m, p) => textEffect(s, m, p.jid, 'sand', p.text);
export const blackpinkCommand = (s, m, p) => textEffect(s, m, p.jid, 'blackpink', p.text);
export const glitchCommand = (s, m, p) => textEffect(s, m, p.jid, 'glitch', p.text);
export const fireCommand = (s, m, p) => textEffect(s, m, p.jid, 'fire', p.text);

// ─── ATTP (animated text to PNG) ─────────────────────────────────
export async function attpCommand(sock, msg, { jid, text }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}attp <text>`);
  try {
    const url = `https://api.lolhuman.xyz/api/attp?apikey=tes&text=${encodeURIComponent(text)}`;
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
  } catch {
    return reply(sock, msg, `❌ ATTP failed. Try a shorter text.`);
  }
}
