import NodeCache from 'node-cache';
import { config } from '../config/config.js';
import fs from 'fs';

const STORE_FILE = './data/store.json';

// Ensure data dir exists
if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });

function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  } catch {}
  return {};
}

function saveStore(data) {
  try { fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2)); } catch {}
}

let _store = loadStore();

// Save every 30 seconds
setInterval(() => saveStore(_store), 30000);

// ─── Group settings ──────────────────────────────────────────────

export function getGroupSettings(jid) {
  if (!_store.groups) _store.groups = {};
  if (!_store.groups[jid]) {
    _store.groups[jid] = {
      antiLink: config.features.antiLink,
      antiBadWord: config.features.antiBadWord,
      welcome: config.features.welcomeMsg,
      goodbye: config.features.goodbyeMsg,
      antiTag: config.features.antiTag,
      chatbot: false,
      muted: false,
      muteUntil: null,
      warnings: {},
    };
  }
  return _store.groups[jid];
}

export function setGroupSetting(jid, key, value) {
  const g = getGroupSettings(jid);
  g[key] = value;
  saveStore(_store);
}

// ─── Warnings ────────────────────────────────────────────────────

export function addWarning(jid, userJid) {
  const g = getGroupSettings(jid);
  if (!g.warnings[userJid]) g.warnings[userJid] = 0;
  g.warnings[userJid]++;
  saveStore(_store);
  return g.warnings[userJid];
}

export function getWarnings(jid, userJid) {
  const g = getGroupSettings(jid);
  return g.warnings[userJid] || 0;
}

export function clearWarnings(jid, userJid) {
  const g = getGroupSettings(jid);
  g.warnings[userJid] = 0;
  saveStore(_store);
}

// ─── Bot owner settings ──────────────────────────────────────────

export function getBotSettings() {
  if (!_store.bot) {
    _store.bot = {
      mode: config.mode,
      autoStatus: config.features.autoStatus,
      autoTyping: config.features.autoTyping,
      autoRecording: config.features.autoRecording,
      autoRead: config.features.autoRead,
      antiCall: config.features.antiCall,
      antiDelete: config.features.antiDelete,
      pmBlocker: false,
      pmBlockerMsg: "I'm busy right now, please wait.",
      statusDelay: 5000,
    };
  }
  return _store.bot;
}

export function setBotSetting(key, value) {
  const b = getBotSettings();
  b[key] = value;
  saveStore(_store);
}

// ─── Blocked users ───────────────────────────────────────────────

export function blockUser(jid) {
  if (!_store.blocked) _store.blocked = [];
  if (!_store.blocked.includes(jid)) _store.blocked.push(jid);
  saveStore(_store);
}

export function unblockUser(jid) {
  if (!_store.blocked) _store.blocked = [];
  _store.blocked = _store.blocked.filter(j => j !== jid);
  saveStore(_store);
}

export function isBlocked(jid) {
  return (_store.blocked || []).includes(jid);
}

export function getBlockedList() {
  return _store.blocked || [];
}

// ─── Game state ──────────────────────────────────────────────────

const gameCache = new NodeCache({ stdTTL: 300 });

export const games = {
  set: (jid, data) => gameCache.set(jid, data),
  get: (jid) => gameCache.get(jid),
  del: (jid) => gameCache.del(jid),
  trivia: {
    set: (jid, data) => gameCache.set(`trivia_${jid}`, data),
    get: (jid) => gameCache.get(`trivia_${jid}`),
    del: (jid) => gameCache.del(`trivia_${jid}`),
  }
};
