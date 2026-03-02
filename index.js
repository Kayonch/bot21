import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidNormalizedUser,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import chalk from 'chalk';
import { config } from './config/config.js';
import { getMsgInfo } from './lib/utils.js';
import { routeCommand } from './lib/router.js';
import {
  handleGroupJoin, handleGroupLeave,
  handleAntiLink, handleAntiBadWord,
  handleAntiDelete, storeMessage,
  handleAutoRead, handleAutoTyping,
  handleAntiCall, handlePMBlocker, handleChatbot
} from './lib/events.js';
import { getBotSettings, isBlocked } from './lib/store.js';
import fs from 'fs';

// ─── Setup ───────────────────────────────────────────────────────
if (!fs.existsSync(config.sessionFolder)) fs.mkdirSync(config.sessionFolder, { recursive: true });

const logger = pino({ level: 'silent' });
const store = makeInMemoryStore({ logger });

// ─── Banner ──────────────────────────────────────────────────────
function printBanner() {
  console.log(chalk.cyan('\n╔══════════════════════════════════╗'));
  console.log(chalk.cyan('║   ') + chalk.bold.yellow(' LTH BOT v' + config.version) + chalk.cyan('               ║'));
  console.log(chalk.cyan('║   ') + chalk.white(' Dev: Lucky218 | Uganda 🇺🇬 ') + chalk.cyan('    ║'));
  console.log(chalk.cyan('╚══════════════════════════════════╝\n'));
}

// ─── Connect ─────────────────────────────────────────────────────
async function startBot() {
  printBanner();

  const { state, saveCreds } = await useMultiFileAuthState(config.sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  console.log(chalk.green(`[BOT] Using Baileys v${version.join('.')}`));

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: true,
    browser: ['LTH Bot', 'Chrome', '120.0.0'],
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
  });

  store.bind(sock.ev);

  // ─── Connection events ────────────────────────────────────────
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log(chalk.yellow('\n[BOT] Scan the QR code above with WhatsApp!\n'));
    }

    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;

      if (code === DisconnectReason.loggedOut) {
        console.log(chalk.red('[BOT] Logged out! Delete session folder and restart.'));
        process.exit(1);
      }

      console.log(chalk.yellow(`[BOT] Disconnected (${code}). Reconnecting in 3s...`));
      setTimeout(startBot, 3000);
    }

    if (connection === 'open') {
      console.log(chalk.green(`\n[BOT] ✅ Connected as ${sock.user?.name || sock.user?.id}`));
      console.log(chalk.green(`[BOT] Mode: ${config.mode} | Prefix: ${config.prefix}\n`));

      // Notify owner
      try {
        await sock.sendMessage(`${config.ownerNumber}@s.whatsapp.net`, {
          text: `✅ *${config.botName} is online!*\n\n🚀 Version: ${config.version}\n⚙️ Mode: ${config.mode}\n🛠️ Prefix: ${config.prefix}`
        });
      } catch {}
    }
  });

  // ─── Save credentials ─────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ─── Group participant events ─────────────────────────────────
  sock.ev.on('group-participants.update', async (event) => {
    await handleGroupJoin(sock, [event]);
    await handleGroupLeave(sock, [event]);
  });

  // ─── Message delete events ────────────────────────────────────
  sock.ev.on('messages.delete', async (event) => {
    if (event.keys) await handleAntiDelete(sock, event.keys);
  });

  // ─── Call events ──────────────────────────────────────────────
  sock.ev.on('call', async (call) => {
    await handleAntiCall(sock, call);
  });

  // ─── Incoming messages ────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue; // ignore bot's own messages

      // Parse message info
      const params = getMsgInfo(msg);
      const { jid, isGroup, sender, isOwner, isCmd, command, body } = params;

      // Store for anti-delete
      storeMessage(msg);

      // Auto-read
      await handleAutoRead(sock, msg);

      // Skip blocked users (unless owner)
      if (!isOwner && isBlocked(sender)) continue;

      // Public/private mode check
      if (config.mode === 'private' && !isOwner) {
        if (!isGroup) {
          await sock.sendMessage(jid, { text: '🔒 Bot is in *private mode*. Only the owner can use it.' });
        }
        continue;
      }

      // PM Blocker
      if (await handlePMBlocker(sock, msg, params)) continue;

      // Anti-link
      if (await handleAntiLink(sock, msg, params)) continue;

      // Anti-bad word
      if (await handleAntiBadWord(sock, msg, params)) continue;

      // Auto-typing indicator
      if (isCmd) await handleAutoTyping(sock, jid);

      // Route commands
      if (isCmd) {
        console.log(chalk.blue(`[CMD] ${sender.replace('@s.whatsapp.net','')} → .${command}`));
        await routeCommand(sock, msg, params);
        continue;
      }

      // Chatbot fallback
      if (body && !isCmd) {
        await handleChatbot(sock, msg, params);
      }
    }
  });

  return sock;
}

// ─── Handle crashes ───────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error(chalk.red('[ERROR] Unhandled rejection:'), err?.message || err);
});

process.on('uncaughtException', (err) => {
  console.error(chalk.red('[ERROR] Uncaught exception:'), err?.message || err);
});

startBot().catch(console.error);
