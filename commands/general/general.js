import axios from 'axios';
import { reply, fetchJson } from '../lib/utils.js';
import { config } from '../config/config.js';
import { runtime } from '../lib/utils.js';

const startTime = Date.now();

// ─── Ping ────────────────────────────────────────────────────────
export async function pingCommand(sock, msg) {
  const before = Date.now();
  await sock.sendMessage(msg.key.remoteJid, { text: '📡 Pinging...' }, { quoted: msg });
  const after = Date.now();
  return reply(sock, msg, `🏓 *Pong!*\n⚡ Speed: *${after - before}ms*`);
}

// ─── Alive ───────────────────────────────────────────────────────
export async function aliveCommand(sock, msg, { pushName }) {
  return reply(sock, msg, `╭─────────────────╮
│  ✅ *BOT IS ALIVE*  │
╰─────────────────╯

👤 *User:* ${pushName}
🤖 *Bot:* ${config.botName}
⏱️ *Uptime:* ${runtime(startTime)}
🔄 *Version:* ${config.version}
🛠️ *Prefix:* ${config.prefix}

> Powered by Lucky Tech Hub 🚀`);
}

// ─── Quote ───────────────────────────────────────────────────────
const quotes = [
  "The only way to do great work is to love what you do. – Steve Jobs",
  "In the middle of every difficulty lies opportunity. – Einstein",
  "Life is what happens when you're busy making other plans. – John Lennon",
  "It does not matter how slowly you go as long as you do not stop. – Confucius",
  "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
  "Strive not to be a success, but rather to be of value. – Einstein",
  "You miss 100% of the shots you don't take. – Wayne Gretzky",
  "Whether you think you can or you think you can't, you're right. – Henry Ford",
  "The best time to plant a tree was 20 years ago. The second best time is now. – Proverb",
  "If life were predictable it would cease to be life. – Eleanor Roosevelt"
];

export async function quoteCommand(sock, msg) {
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  return reply(sock, msg, `💬 *Quote of the Moment*\n\n"${q}"`);
}

// ─── Fact ────────────────────────────────────────────────────────
const facts = [
  "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs.",
  "A group of flamingos is called a 'flamboyance'.",
  "Octopuses have three hearts and blue blood.",
  "Bananas are berries, but strawberries are not.",
  "The Eiffel Tower can grow up to 6 inches taller in summer due to heat expansion.",
  "A day on Venus is longer than a year on Venus.",
  "Sharks are older than trees — they've been around for over 400 million years.",
  "The average person walks about 100,000 miles in their lifetime.",
  "An astronaut's footprint on the moon could last 100 million years.",
  "Tigers have striped skin, not just striped fur."
];

export async function factCommand(sock, msg) {
  const f = facts[Math.floor(Math.random() * facts.length)];
  return reply(sock, msg, `🧠 *Random Fact*\n\n${f}`);
}

// ─── Joke ────────────────────────────────────────────────────────
export async function jokeCommand(sock, msg) {
  try {
    const data = await fetchJson('https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist,sexist');
    let joke = '';
    if (data.type === 'single') {
      joke = data.joke;
    } else {
      joke = `${data.setup}\n\n😂 ${data.delivery}`;
    }
    return reply(sock, msg, `😄 *Joke Time!*\n\n${joke}`);
  } catch {
    return reply(sock, msg, '😅 Could not fetch a joke right now, try again!');
  }
}

// ─── Define ──────────────────────────────────────────────────────
export async function defineCommand(sock, msg, { text }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}define <word>`);
  try {
    const data = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`);
    const entry = data[0];
    const phonetic = entry.phonetic || '';
    const meanings = entry.meanings.slice(0, 2).map(m => {
      const defs = m.definitions.slice(0, 2).map((d, i) => `  ${i + 1}. ${d.definition}`).join('\n');
      return `*${m.partOfSpeech}*\n${defs}`;
    }).join('\n\n');
    return reply(sock, msg, `📖 *${entry.word}* ${phonetic}\n\n${meanings}`);
  } catch {
    return reply(sock, msg, `❌ No definition found for "*${text}*"`);
  }
}

// ─── Weather ─────────────────────────────────────────────────────
export async function weatherCommand(sock, msg, { text }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}weather <city>`);
  if (!config.weatherKey) return reply(sock, msg, '⚠️ Weather API key not configured in .env');
  try {
    const data = await fetchJson(
      `http://api.weatherapi.com/v1/current.json?key=${config.weatherKey}&q=${encodeURIComponent(text)}&aqi=no`
    );
    const { location, current } = data;
    return reply(sock, msg,
`🌤️ *Weather in ${location.name}, ${location.country}*

🌡️ *Temp:* ${current.temp_c}°C / ${current.temp_f}°F
🤔 *Feels Like:* ${current.feelslike_c}°C
💧 *Humidity:* ${current.humidity}%
💨 *Wind:* ${current.wind_kph} km/h
☁️ *Condition:* ${current.condition.text}
👁️ *Visibility:* ${current.vis_km} km
🕐 *Local Time:* ${location.localtime}`
    );
  } catch {
    return reply(sock, msg, `❌ Could not get weather for "*${text}*". Check the city name.`);
  }
}

// ─── News ────────────────────────────────────────────────────────
export async function newsCommand(sock, msg) {
  if (!config.newsKey) return reply(sock, msg, '⚠️ News API key not configured in .env');
  try {
    const data = await fetchJson(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${config.newsKey}`
    );
    const headlines = data.articles.slice(0, 5).map((a, i) =>
      `${i + 1}. *${a.title}*\n   📰 ${a.source.name}`
    ).join('\n\n');
    return reply(sock, msg, `📰 *Top Headlines*\n\n${headlines}\n\n_Powered by NewsAPI_`);
  } catch {
    return reply(sock, msg, '❌ Could not fetch news right now.');
  }
}

// ─── 8Ball ───────────────────────────────────────────────────────
const eightBallResponses = [
  '✅ It is certain', '✅ It is decidedly so', '✅ Without a doubt',
  '✅ Yes definitely', '✅ You may rely on it', '✅ As I see it, yes',
  '✅ Most likely', '✅ Outlook good', '✅ Yes', '✅ Signs point to yes',
  '🤔 Reply hazy try again', '🤔 Ask again later', '🤔 Better not tell you now',
  '🤔 Cannot predict now', '🤔 Concentrate and ask again',
  '❌ Don\'t count on it', '❌ My reply is no', '❌ My sources say no',
  '❌ Outlook not so good', '❌ Very doubtful'
];

export async function eightBallCommand(sock, msg, { text }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}8ball <question>`);
  const answer = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
  return reply(sock, msg, `🎱 *Magic 8 Ball*\n\n❓ ${text}\n\n${answer}`);
}

// ─── Translate ───────────────────────────────────────────────────
export async function translateCommand(sock, msg, { args }) {
  // Usage: .trt <text> <langcode>
  if (args.length < 2) return reply(sock, msg, `❓ Usage: ${config.prefix}trt <text> <lang_code>\nExample: .trt Hello World es`);
  const lang = args[args.length - 1];
  const text = args.slice(0, -1).join(' ');
  try {
    const res = await fetchJson(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`
    );
    const translated = res.responseData?.translatedText;
    return reply(sock, msg, `🌐 *Translation*\n\n📝 Original: ${text}\n🔤 Translated (${lang}): ${translated}`);
  } catch {
    return reply(sock, msg, '❌ Translation failed. Check language code (e.g. es, fr, de, sw)');
  }
}

// ─── Bible ───────────────────────────────────────────────────────
export async function bibleCommand(sock, msg, { text }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}bible <verse>\nExample: .bible John 3:16`);
  try {
    const res = await fetchJson(`https://bible-api.com/${encodeURIComponent(text)}`);
    if (!res.text) throw new Error();
    return reply(sock, msg, `📖 *${res.reference}*\n\n${res.text.trim()}`);
  } catch {
    return reply(sock, msg, `❌ Verse not found. Try format: John 3:16`);
  }
}

export async function bibleListCommand(sock, msg) {
  const books = `📖 *Books of the Bible*\n\n*Old Testament:*\nGenesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi\n\n*New Testament:*\nMatthew, Mark, Luke, John, Acts, Romans, 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, 2 Thessalonians, 1 Timothy, 2 Timothy, Titus, Philemon, Hebrews, James, 1 Peter, 2 Peter, 1 John, 2 John, 3 John, Jude, Revelation`;
  return reply(sock, msg, books);
}

// ─── Country Info ────────────────────────────────────────────────
export async function countryInfoCommand(sock, msg, { text }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}cinfo <country name>`);
  try {
    const data = await fetchJson(`https://restcountries.com/v3.1/name/${encodeURIComponent(text)}`);
    const c = data[0];
    const capital = c.capital?.[0] || 'N/A';
    const region = c.region || 'N/A';
    const pop = c.population?.toLocaleString() || 'N/A';
    const lang = Object.values(c.languages || {}).join(', ') || 'N/A';
    const currency = Object.values(c.currencies || {}).map(cur => `${cur.name} (${cur.symbol})`).join(', ') || 'N/A';
    const flag = c.flag || '';
    return reply(sock, msg,
`🌍 *${c.name.common}* ${flag}

🏙️ *Capital:* ${capital}
🌎 *Region:* ${region} / ${c.subregion || ''}
👥 *Population:* ${pop}
🗣️ *Language(s):* ${lang}
💵 *Currency:* ${currency}
🌐 *TLD:* ${(c.tld || []).join(', ')}
📞 *Calling Code:* +${(c.idd?.root || '').replace('+', '')}${(c.idd?.suffixes || [''])[0]}`
    );
  } catch {
    return reply(sock, msg, `❌ Country "*${text}*" not found.`);
  }
}

// ─── EPL Standings ───────────────────────────────────────────────
export async function eplCommand(sock, msg) {
  try {
    const data = await fetchJson('https://api.football-data.org/v4/competitions/PL/standings', {
      headers: { 'X-Auth-Token': '6f4e5e7e6b5a4c3d2e1f0a9b8c7d6e5f' } // public free key placeholder
    });
    const table = data.standings[0].table.slice(0, 10);
    let text = '⚽ *EPL Top 10 Standings*\n\n';
    table.forEach(t => {
      text += `${t.position}. *${t.team.shortName}* - ${t.points} pts (${t.won}W ${t.draw}D ${t.lost}L)\n`;
    });
    return reply(sock, msg, text);
  } catch {
    return reply(sock, msg, '❌ Could not fetch EPL standings. API key may need updating in general.js');
  }
}

// ─── TTS ─────────────────────────────────────────────────────────
export async function ttsCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}tts <text>`);
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`;
    const buffer = await fetchBuffer(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return sock.sendMessage(jid, { audio: buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ TTS failed. Try a shorter text.');
  }
}

// ─── Dev ─────────────────────────────────────────────────────────
export async function devCommand(sock, msg) {
  return reply(sock, msg,
`👑 *Bot Developer Info*

🔹 *Name:* Lucky218
🔹 *YouTube:* Lucky Tech Hub
🔹 *Location:* Uganda 🇺🇬
🔹 *Bot Version:* ${config.version}
🔹 *WhatsApp:* wa.me/${config.ownerNumber}

> Thanks for using ${config.botName}! ❤️`
  );
}

// ─── Owner ───────────────────────────────────────────────────────
export async function ownerCommand(sock, msg) {
  return reply(sock, msg,
`👤 *Bot Owner*

🔹 *Name:* ${config.ownerName}
📞 *Contact:* wa.me/${config.ownerNumber}

> Reach out for support or collaboration!`
  );
}

// ─── JID ─────────────────────────────────────────────────────────
export async function jidCommand(sock, msg, { sender, jid }) {
  return reply(sock, msg,
`🆔 *JID Info*

👤 *Your JID:* ${sender}
💬 *Chat JID:* ${jid}`
  );
}

// ─── Lyrics ──────────────────────────────────────────────────────
export async function lyricsCommand(sock, msg, { text }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}lyrics <song title>`);
  try {
    const res = await fetchJson(`https://lyrist.vercel.app/api/${encodeURIComponent(text)}`);
    if (!res.lyrics) throw new Error();
    const lyrics = res.lyrics.slice(0, 3000); // trim if too long
    return reply(sock, msg, `🎵 *${res.title}* by *${res.artist}*\n\n${lyrics}${res.lyrics.length > 3000 ? '\n...[trimmed]' : ''}`);
  } catch {
    return reply(sock, msg, `❌ Lyrics not found for "*${text}*"`);
  }
}

// ─── Group Info ──────────────────────────────────────────────────
export async function groupInfoCommand(sock, msg, { jid, isGroup }) {
  if (!isGroup) return reply(sock, msg, '❌ This command only works in groups!');
  try {
    const meta = await sock.groupMetadata(jid);
    const admins = meta.participants.filter(p => p.admin).length;
    const members = meta.participants.length;
    return reply(sock, msg,
`👥 *Group Info*

📛 *Name:* ${meta.subject}
🆔 *ID:* ${meta.id}
📝 *Description:* ${meta.desc || 'No description'}
👤 *Members:* ${members}
👑 *Admins:* ${admins}
📅 *Created:* ${new Date(meta.creation * 1000).toLocaleDateString()}`
    );
  } catch {
    return reply(sock, msg, '❌ Could not get group info.');
  }
}

// ─── Staff/Admins ────────────────────────────────────────────────
export async function staffCommand(sock, msg, { jid, isGroup }) {
  if (!isGroup) return reply(sock, msg, '❌ This command only works in groups!');
  try {
    const meta = await sock.groupMetadata(jid);
    const admins = meta.participants.filter(p => p.admin);
    let text = `👑 *Group Admins (${admins.length})*\n\n`;
    admins.forEach((a, i) => {
      text += `${i + 1}. @${a.id.replace('@s.whatsapp.net', '')}${a.admin === 'superadmin' ? ' 👑' : ''}\n`;
    });
    return sock.sendMessage(jid, {
      text,
      mentions: admins.map(a => a.id)
    }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Could not get admin list.');
  }
}
