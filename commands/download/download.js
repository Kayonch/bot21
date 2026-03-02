import axios from 'axios';
import { reply, fetchBuffer, sendAudio, sendVideo } from '../lib/utils.js';
import { config } from '../config/config.js';
import ytSearch from 'yt-search';

// ─── Helper: format duration ─────────────────────────────────────
function formatDur(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// ─── YouTube Search ──────────────────────────────────────────────
async function searchYT(query) {
  const results = await ytSearch(query);
  return results.videos[0];
}

// ─── Play (audio) ────────────────────────────────────────────────
export async function playCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}play <song name>`);
  await reply(sock, msg, `🔍 Searching for: _${text}_...`);
  try {
    const video = await searchYT(text);
    if (!video) return reply(sock, msg, '❌ No results found!');
    await reply(sock, msg, `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n\n⏳ Downloading audio...`);
    // Use free yt-download API
    const apiUrl = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`;
    const data = await axios.get(apiUrl).then(r => r.data);
    if (!data?.data?.url) throw new Error('No download URL');
    const buffer = await fetchBuffer(data.data.url);
    await sock.sendMessage(jid, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`
    }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Download failed. Try a different search or use a direct YouTube link.');
  }
}

// ─── Song (alias for play with cover art) ────────────────────────
export const songCommand = playCommand;

// ─── Video ───────────────────────────────────────────────────────
export async function videoCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}video <song/video name>`);
  await reply(sock, msg, `🔍 Searching for video: _${text}_...`);
  try {
    const video = await searchYT(text);
    if (!video) return reply(sock, msg, '❌ No results found!');
    await reply(sock, msg, `🎬 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n\n⏳ Downloading video...`);
    const apiUrl = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(video.url)}`;
    const data = await axios.get(apiUrl).then(r => r.data);
    if (!data?.data?.url) throw new Error('No download URL');
    const buffer = await fetchBuffer(data.data.url);
    await sock.sendMessage(jid, {
      video: buffer,
      caption: `🎬 ${video.title}`,
      fileName: `${video.title}.mp4`
    }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Video download failed. Video may be too long or unavailable.');
  }
}

// ─── YTMP4 direct link ───────────────────────────────────────────
export async function ytmp4Command(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}ytmp4 <YouTube URL>`);
  if (!text.includes('youtu')) return reply(sock, msg, '❌ Please provide a valid YouTube URL');
  await reply(sock, msg, '⏳ Downloading video...');
  try {
    const apiUrl = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(text)}`;
    const data = await axios.get(apiUrl).then(r => r.data);
    if (!data?.data?.url) throw new Error('No download URL');
    const buffer = await fetchBuffer(data.data.url);
    await sock.sendMessage(jid, {
      video: buffer,
      caption: '🎬 Here is your video!'
    }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Download failed. Video may be too large or unavailable.');
  }
}

// ─── TikTok ──────────────────────────────────────────────────────
export async function tiktokCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}tiktok <link>`);
  await reply(sock, msg, '⏳ Downloading TikTok...');
  try {
    const res = await axios.post('https://www.tikwm.com/api/', { url: text, count: 1, cursor: 0, web: 1, hd: 1 });
    const data = res.data.data;
    if (!data?.play) throw new Error('No video');
    const buffer = await fetchBuffer(data.play);
    await sock.sendMessage(jid, {
      video: buffer,
      caption: `🎵 ${data.title || 'TikTok Video'}\n👤 @${data.author?.unique_id || ''}`
    }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ TikTok download failed. Check the link.');
  }
}

// ─── Instagram ───────────────────────────────────────────────────
export async function instagramCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}instagram <link>`);
  await reply(sock, msg, '⏳ Downloading Instagram media...');
  try {
    const res = await axios.get(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(text)}`);
    const data = res.data.data;
    if (!data || !data.length) throw new Error('No media');
    const mediaUrl = data[0].url;
    const buffer = await fetchBuffer(mediaUrl);
    const isVideo = data[0].type === 'video' || mediaUrl.includes('.mp4');
    if (isVideo) {
      await sock.sendMessage(jid, { video: buffer, caption: '📸 Instagram video' }, { quoted: msg });
    } else {
      await sock.sendMessage(jid, { image: buffer, caption: '📸 Instagram photo' }, { quoted: msg });
    }
  } catch {
    return reply(sock, msg, '❌ Instagram download failed. Make sure the post is public.');
  }
}

// ─── Facebook ────────────────────────────────────────────────────
export async function facebookCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}facebook <link>`);
  await reply(sock, msg, '⏳ Downloading Facebook video...');
  try {
    const res = await axios.get(`https://api.siputzx.my.id/api/d/fbdl?url=${encodeURIComponent(text)}`);
    const url = res.data?.data?.url_sd || res.data?.data?.url;
    if (!url) throw new Error('No video URL');
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(jid, { video: buffer, caption: '📘 Facebook Video' }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Facebook download failed.');
  }
}

// ─── Spotify ─────────────────────────────────────────────────────
export async function spotifyCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}spotify <song name or link>`);
  // Search on YouTube and download as it's the most reliable
  await reply(sock, msg, `🎵 Searching Spotify-style for: _${text}_...`);
  try {
    const video = await searchYT(text + ' official audio');
    if (!video) return reply(sock, msg, '❌ Not found!');
    const apiUrl = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`;
    const data = await axios.get(apiUrl).then(r => r.data);
    if (!data?.data?.url) throw new Error();
    const buffer = await fetchBuffer(data.data.url);
    await sock.sendMessage(jid, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`
    }, { quoted: msg });
  } catch {
    return reply(sock, msg, '❌ Spotify search failed.');
  }
}

// ─── APK ─────────────────────────────────────────────────────────
export async function apkCommand(sock, msg, { text }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}apk <app name>`);
  try {
    const res = await axios.get(`https://api.siputzx.my.id/api/s/playstore?q=${encodeURIComponent(text)}`);
    const app = res.data?.data?.[0];
    if (!app) return reply(sock, msg, `❌ App "*${text}*" not found on Play Store`);
    return reply(sock, msg,
`📦 *${app.title}*
⭐ Rating: ${app.score || 'N/A'}
🗓️ Updated: ${app.updated || 'N/A'}
📝 ${(app.description || '').slice(0, 200)}...
🔗 Link: ${app.url}`
    );
  } catch {
    return reply(sock, msg, '❌ APK search failed.');
  }
}
