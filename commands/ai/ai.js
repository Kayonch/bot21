import axios from 'axios';
import { reply, fetchBuffer, sendImage } from '../lib/utils.js';
import { config } from '../config/config.js';

// ─── GPT ─────────────────────────────────────────────────────────
export async function gptCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}gpt <question>`);
  if (!config.openaiKey) return reply(sock, msg, '⚠️ OpenAI API key not configured in .env');
  await sock.sendPresenceUpdate('composing', jid);
  try {
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: text }],
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${config.openaiKey}`,
        'Content-Type': 'application/json'
      }
    });
    const answer = res.data.choices[0].message.content;
    return reply(sock, msg, `🤖 *GPT Response*\n\n${answer}`);
  } catch (e) {
    return reply(sock, msg, `❌ GPT Error: ${e?.response?.data?.error?.message || 'Unknown error'}`);
  }
}

// ─── Gemini ──────────────────────────────────────────────────────
export async function geminiCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}gemini <question>`);
  if (!config.geminiKey) return reply(sock, msg, '⚠️ Gemini API key not configured in .env');
  await sock.sendPresenceUpdate('composing', jid);
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.geminiKey}`,
      { contents: [{ parts: [{ text }] }] }
    );
    const answer = res.data.candidates[0].content.parts[0].text;
    return reply(sock, msg, `✨ *Gemini Response*\n\n${answer}`);
  } catch (e) {
    return reply(sock, msg, `❌ Gemini Error: ${e?.response?.data?.error?.message || 'Unknown error'}`);
  }
}

// ─── LLaMA3 (via Hugging Face) ───────────────────────────────────
export async function llama3Command(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}llama3 <query>`);
  await sock.sendPresenceUpdate('composing', jid);
  try {
    // Using a free API endpoint (Groq or HF)
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: text }],
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${config.hfToken}`,
        'Content-Type': 'application/json'
      }
    });
    const answer = res.data.choices[0].message.content;
    return reply(sock, msg, `🦙 *LLaMA3 Response*\n\n${answer}`);
  } catch {
    // Fallback: use free pollinations AI
    try {
      const res = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(text)}`);
      return reply(sock, msg, `🦙 *LLaMA3 Response*\n\n${res.data}`);
    } catch {
      return reply(sock, msg, '❌ LLaMA3 failed. Please set a Groq API key in .env as HF_TOKEN');
    }
  }
}

// ─── Lucky AI (custom) ───────────────────────────────────────────
export async function luckyCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}lucky <question>`);
  await sock.sendPresenceUpdate('composing', jid);
  try {
    // Free AI via pollinations
    const res = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(text)}`);
    return reply(sock, msg, `🍀 *Lucky AI Response*\n\n${res.data}`);
  } catch {
    return reply(sock, msg, '❌ Lucky AI failed. Try again!');
  }
}

// ─── Imagine (Stable Diffusion via Pollinations) ─────────────────
export async function imagineCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}imagine <prompt>`);
  await reply(sock, msg, `🎨 Generating image for: _"${text}"_...`);
  try {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true`;
    const buffer = await fetchBuffer(url);
    await sendImage(sock, jid, buffer, `🎨 *Imagine*\n> ${text}`, msg);
  } catch {
    return reply(sock, msg, '❌ Image generation failed. Try a different prompt.');
  }
}

// ─── Flux ────────────────────────────────────────────────────────
export async function fluxCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}flux <prompt>`);
  await reply(sock, msg, `⚡ Flux generating: _"${text}"_...`);
  try {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?model=flux&width=1024&height=1024&nologo=true`;
    const buffer = await fetchBuffer(url);
    await sendImage(sock, jid, buffer, `⚡ *Flux*\n> ${text}`, msg);
  } catch {
    return reply(sock, msg, '❌ Flux generation failed.');
  }
}

// ─── Sora (video-style images) ───────────────────────────────────
export async function soraCommand(sock, msg, { text, jid }) {
  if (!text) return reply(sock, msg, `❓ Usage: ${config.prefix}sora <prompt>`);
  await reply(sock, msg, `🎬 Sora generating: _"${text}"_...`);
  try {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(text + ' cinematic video frame')}?model=flux&width=1920&height=1080&nologo=true`;
    const buffer = await fetchBuffer(url);
    await sendImage(sock, jid, buffer, `🎬 *Sora*\n> ${text}`, msg);
  } catch {
    return reply(sock, msg, '❌ Sora generation failed.');
  }
}
