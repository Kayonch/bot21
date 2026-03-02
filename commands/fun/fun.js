import { reply, sendImage, fetchBuffer } from '../lib/utils.js';
import { config } from '../config/config.js';
import axios from 'axios';

// ─── Compliment ──────────────────────────────────────────────────
const compliments = [
  "You're one of a kind, and the world is a better place because you're in it! 🌟",
  "Your kindness is like a beacon in the dark — it guides everyone around you 💡",
  "You have an extraordinary ability to make people feel special ❤️",
  "Your smile could light up an entire room 😊",
  "You bring out the best in everyone around you 🌺",
];

export async function complimentCommand(sock, msg, { jid, mentionedJid }) {
  const target = mentionedJid[0];
  const c = compliments[Math.floor(Math.random() * compliments.length)];
  if (target) {
    return sock.sendMessage(jid, {
      text: `💐 Hey @${target.replace('@s.whatsapp.net','')}, ${c}`,
      mentions: [target]
    }, { quoted: msg });
  }
  return reply(sock, msg, `💐 ${c}`);
}

// ─── Insult ──────────────────────────────────────────────────────
const insults = [
  "You're not stupid, you just have bad luck thinking 🧠",
  "I'd explain it to you, but I left my crayons at home 🖍️",
  "You have the perfect face for radio 📻",
  "I've met potatoes smarter than you 🥔",
  "Your secrets are always safe with me. I never pay attention to anything you say 🙉",
];

export async function insultCommand(sock, msg, { jid, mentionedJid }) {
  const target = mentionedJid[0];
  const insult = insults[Math.floor(Math.random() * insults.length)];
  if (target) {
    return sock.sendMessage(jid, {
      text: `😈 @${target.replace('@s.whatsapp.net','')}: ${insult}`,
      mentions: [target]
    }, { quoted: msg });
  }
  return reply(sock, msg, `😈 ${insult}`);
}

// ─── Flirt ───────────────────────────────────────────────────────
const flirts = [
  "Are you a magician? Every time I look at you, everyone else disappears ✨",
  "Do you have a map? I keep getting lost in your eyes 👀",
  "Is your name Google? Because you've got everything I've been searching for 🔍",
  "Are you a parking ticket? Because you've got 'fine' written all over you 😏",
  "I must be in a museum, because you truly are a work of art 🎨",
];

export async function flirtCommand(sock, msg) {
  const f = flirts[Math.floor(Math.random() * flirts.length)];
  return reply(sock, msg, `💝 ${f}`);
}

// ─── Hack ────────────────────────────────────────────────────────
export async function hackCommand(sock, msg, { jid, mentionedJid, sender }) {
  const target = mentionedJid[0] || sender;
  const name = target.replace('@s.whatsapp.net', '');
  const steps = [
    '🔓 Initializing hack protocol...',
    `💻 Accessing ${name}'s device...`,
    '📡 Bypassing firewall...',
    '🔐 Cracking encryption...',
    '📂 Accessing files...',
    '📧 Reading messages...',
    '💳 Found: 3 credit cards (hehe)...',
    '📸 Accessing camera... 👁️',
    `✅ Hack complete! ${name} has been *owned* 😂`,
  ];
  let i = 0;
  const sent = await sock.sendMessage(jid, { text: steps[0], mentions: [target] }, { quoted: msg });
  const interval = setInterval(async () => {
    i++;
    if (i >= steps.length) { clearInterval(interval); return; }
    await sock.sendMessage(jid, { text: steps[i], mentions: [target], edit: sent.key });
  }, 1000);
}

// ─── Ship ────────────────────────────────────────────────────────
export async function shipCommand(sock, msg, { jid, mentionedJid, sender }) {
  const p1 = sender;
  const p2 = mentionedJid[0];
  if (!p2) return reply(sock, msg, `❓ Usage: ${config.prefix}ship @user`);
  const pct = Math.floor(Math.random() * 101);
  const hearts = '❤️'.repeat(Math.round(pct / 20));
  const emoji = pct >= 80 ? '💑' : pct >= 60 ? '💕' : pct >= 40 ? '💓' : pct >= 20 ? '💔' : '😬';
  return sock.sendMessage(jid, {
    text: `${emoji} *Shipping...*\n\n@${p1.replace('@s.whatsapp.net','')} 💘 @${p2.replace('@s.whatsapp.net','')}\n\n💞 Compatibility: *${pct}%*\n${hearts}`,
    mentions: [p1, p2]
  }, { quoted: msg });
}

// ─── Simp ────────────────────────────────────────────────────────
export async function simpCommand(sock, msg, { jid, mentionedJid, sender }) {
  const target = mentionedJid[0] || sender;
  const pct = Math.floor(Math.random() * 101);
  return sock.sendMessage(jid, {
    text: `🥺 *Simp Meter*\n\n@${target.replace('@s.whatsapp.net','')} is *${pct}%* simp\n\n${'💙'.repeat(Math.round(pct/20))}`,
    mentions: [target]
  }, { quoted: msg });
}

// ─── Character ───────────────────────────────────────────────────
const characters = ['🦁 Lion — Bold, brave, natural leader', '🦊 Fox — Clever, witty, always one step ahead', '🐺 Wolf — Loyal pack member, fierce protector', '🦋 Butterfly — Free spirit, full of transformation', '🐉 Dragon — Powerful, wise, legendary', '🦅 Eagle — Visionary, sees the big picture', '🐬 Dolphin — Playful, intelligent, social', '🦒 Giraffe — Stands tall, sees far', '🐸 Frog — Adaptable, makes big leaps'];

export async function characterCommand(sock, msg, { jid, mentionedJid, sender }) {
  const target = mentionedJid[0] || sender;
  const char = characters[Math.floor(Math.random() * characters.length)];
  return sock.sendMessage(jid, {
    text: `🎭 *Character Analysis*\n\n@${target.replace('@s.whatsapp.net','')} is a...\n\n${char}`,
    mentions: [target]
  }, { quoted: msg });
}

// ─── Wasted ──────────────────────────────────────────────────────
export async function wastedCommand(sock, msg, { jid, mentionedJid, sender }) {
  const target = mentionedJid[0] || sender;
  return sock.sendMessage(jid, {
    text: `💀 *WASTED* 💀\n\n@${target.replace('@s.whatsapp.net','')} has been eliminated from the game of life! 🎮`,
    mentions: [target]
  }, { quoted: msg });
}

// ─── Shayari ─────────────────────────────────────────────────────
const shayaris = [
  "Waqt ke saath sab kuch badalta hai,\nPar yaadon mein jo tum ho, woh kabhi nahi jaate... 💫",
  "Teri aankhon mein khoya tha main,\nAb unhe yaad karta hoon... 🌙",
  "Dil ke dard ko bayan karna mushkil hai,\nJab tum paas nahi hote, har pal mushkil hai... 💔",
];

export async function shayariCommand(sock, msg) {
  const s = shayaris[Math.floor(Math.random() * shayaris.length)];
  return reply(sock, msg, `🌹 *Shayari*\n\n${s}`);
}

// ─── Goodnight ───────────────────────────────────────────────────
export async function goodnightCommand(sock, msg, { pushName }) {
  return reply(sock, msg,
`🌙 *Goodnight, ${pushName}!*

🌟 May your dreams be sweet
✨ May tomorrow be bright
💤 Sleep tight, don't let the bed bugs bite
🌙 Good night! 😴`
  );
}

// ─── Rose Day ────────────────────────────────────────────────────
export async function rosedayCommand(sock, msg) {
  return reply(sock, msg,
`🌹 *Happy Rose Day!*

🌹 A rose for you,
🌹 As beautiful as you are,
🌹 May love always bloom in your life,
🌹 Just like this rose...

Happy Rose Day! ❤️`
  );
}

// ─── Stupid ──────────────────────────────────────────────────────
export async function stupidCommand(sock, msg, { jid, mentionedJid, args }) {
  const target = mentionedJid[0];
  if (!target) return reply(sock, msg, `❓ Usage: ${config.prefix}stupid @user [text]`);
  const text = args.slice(1).join(' ') || "You're the stupidest person I've ever seen! 🤦";
  return sock.sendMessage(jid, {
    text: `🤦 @${target.replace('@s.whatsapp.net','')}: ${text}`,
    mentions: [target]
  }, { quoted: msg });
}
