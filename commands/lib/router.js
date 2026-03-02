import { config } from '../config/config.js';
import { getMsgInfo } from './utils.js';

// ─── Import all command modules ──────────────────────────────────
import { menuCommand } from '../commands/general/menu.js';
import {
  pingCommand, aliveCommand, quoteCommand, factCommand, jokeCommand,
  defineCommand, weatherCommand, newsCommand, eightBallCommand,
  translateCommand, bibleCommand, bibleListCommand, countryInfoCommand,
  eplCommand, ttsCommand, devCommand, ownerCommand, jidCommand,
  lyricsCommand, groupInfoCommand, staffCommand
} from '../commands/general/general.js';
import {
  banCommand, kickCommand, promoteCommand, demoteCommand,
  muteCommand, unmuteCommand, deleteCommand,
  warnCommand, warningsCommand, tagCommand, tagAllCommand, tagNotAdminCommand,
  hideTagCommand, antilinkCommand, antibadwordCommand,
  welcomeCommand, goodbyeCommand, chatbotCommand, resetLinkCommand,
  antiTagCommand, setGroupNameCommand, setGroupDescCommand,
  setGroupPPCommand, clearCommand
} from '../commands/admin/admin.js';
import {
  modeCommand, blockCommand, unblockCommand, blockListCommand,
  settingsCommand, autoStatusCommand, autoTypingCommand,
  autoRecordingCommand, autoReadCommand, antiCallCommand,
  antiDeleteCommand, pmBlockerCommand, setBotPPCommand,
  clearSessionCommand, clearTmpCommand, updateCommand,
  autoStatusDelayCommand
} from '../commands/owner/owner.js';
import {
  gptCommand, geminiCommand, llama3Command, luckyCommand,
  imagineCommand, fluxCommand, soraCommand
} from '../commands/ai/ai.js';
import {
  tictactoeCommand, hangmanCommand, guessCommand,
  triviaCommand, answerCommand, truthCommand, dareCommand
} from '../commands/games/games.js';
import {
  playCommand, songCommand, videoCommand, ytmp4Command,
  tiktokCommand, instagramCommand, facebookCommand,
  spotifyCommand, apkCommand
} from '../commands/download/download.js';
import {
  complimentCommand, insultCommand, flirtCommand, hackCommand,
  shipCommand, simpCommand, characterCommand, wastedCommand,
  shayariCommand, goodnightCommand, rosedayCommand, stupidCommand
} from '../commands/fun/fun.js';
import {
  stickerCommand, simageCommand, blurCommand, removeBGCommand,
  memeCommand, emojiMixCommand, screenshotCommand,
  nekoCommand, waifuCommand, nomCommand, pokeCommand, cryCommand,
  kissCommand, patCommand, hugCommand, winkCommand, facepalmCommand,
  loliCommand, heartCommand, circleCommand, githubCommand, scriptCommand, vvCommand
} from '../commands/media/media.js';
import {
  metallicCommand, iceCommand, snowCommand, impressiveCommand,
  matrixCommand, lightCommand, neonCommand, devilCommand,
  purpleCommand, thunderCommand, leavesCommand, year1917Command,
  arenaCommand, hackerCommand, sandCommand, blackpinkCommand,
  glitchCommand, fireCommand, attpCommand
} from '../commands/media/textmaker.js';

// ─── Command map ─────────────────────────────────────────────────
export const commands = {
  // General
  menu: menuCommand,
  allmenu: menuCommand,
  ping: pingCommand,
  alive: aliveCommand,
  quote: quoteCommand,
  fact: factCommand,
  joke: jokeCommand,
  define: defineCommand,
  weather: weatherCommand,
  news: newsCommand,
  '8ball': eightBallCommand,
  trt: translateCommand,
  bible: bibleCommand,
  biblelist: bibleListCommand,
  cinfo: countryInfoCommand,
  epl: eplCommand,
  tts: ttsCommand,
  dev: devCommand,
  owner: ownerCommand,
  jid: jidCommand,
  lyrics: lyricsCommand,
  groupinfo: groupInfoCommand,
  staff: staffCommand,
  admins: staffCommand,
  vv: vvCommand,
  ok: vvCommand,
  wow: vvCommand,
  ss: screenshotCommand,
  url: screenshotCommand,
  check: aliveCommand,

  // Admin
  ban: banCommand,
  kick: kickCommand,
  promote: promoteCommand,
  demote: demoteCommand,
  mute: muteCommand,
  unmute: unmuteCommand,
  delete: deleteCommand,
  del: deleteCommand,
  warn: warnCommand,
  warnings: warningsCommand,
  tag: tagCommand,
  tagall: tagAllCommand,
  tagnotadmin: tagNotAdminCommand,
  hidetag: hideTagCommand,
  antilink: antilinkCommand,
  antibadword: antibadwordCommand,
  welcome: welcomeCommand,
  goodbye: goodbyeCommand,
  chatbot: chatbotCommand,
  resetlink: resetLinkCommand,
  antitag: antiTagCommand,
  setgname: setGroupNameCommand,
  setgdesc: setGroupDescCommand,
  setgpp: setGroupPPCommand,
  clear: clearCommand,

  // Owner
  mode: modeCommand,
  block: blockCommand,
  unblock: unblockCommand,
  blocked: blockListCommand,
  blocklist: blockListCommand,
  settings: settingsCommand,
  autostatus: autoStatusCommand,
  autotyping: autoTypingCommand,
  autorecording: autoRecordingCommand,
  autoread: autoReadCommand,
  anticall: antiCallCommand,
  antidelete: antiDeleteCommand,
  pmblocker: pmBlockerCommand,
  setpp: setBotPPCommand,
  clearsession: clearSessionCommand,
  cleartmp: clearTmpCommand,
  update: updateCommand,

  // AI
  gpt: gptCommand,
  gemini: geminiCommand,
  llama3: llama3Command,
  lucky: luckyCommand,
  imagine: imagineCommand,
  flux: fluxCommand,
  sora: soraCommand,

  // Games
  tictactoe: tictactoeCommand,
  hangman: hangmanCommand,
  guess: guessCommand,
  trivia: triviaCommand,
  answer: answerCommand,
  truth: truthCommand,
  dare: dareCommand,

  // Download
  play: playCommand,
  song: songCommand,
  video: videoCommand,
  ytmp4: ytmp4Command,
  tiktok: tiktokCommand,
  instagram: instagramCommand,
  facebook: facebookCommand,
  spotify: spotifyCommand,
  apk: apkCommand,

  // Fun
  compliment: complimentCommand,
  insult: insultCommand,
  flirt: flirtCommand,
  hack: hackCommand,
  ship: shipCommand,
  simp: simpCommand,
  character: characterCommand,
  wasted: wastedCommand,
  shayari: shayariCommand,
  goodnight: goodnightCommand,
  roseday: rosedayCommand,
  stupid: stupidCommand,

  // Media / Sticker
  sticker: stickerCommand,
  simage: simageCommand,
  blur: blurCommand,
  removebg: removeBGCommand,
  meme: memeCommand,
  emojimix: emojiMixCommand,

  // Anime
  neko: nekoCommand,
  waifu: waifuCommand,
  loli: loliCommand,
  nom: nomCommand,
  poke: pokeCommand,
  cry: cryCommand,
  kiss: kissCommand,
  pat: patCommand,
  hug: hugCommand,
  wink: winkCommand,
  facepalm: facepalmCommand,

  // Misc
  heart: heartCommand,
  circle: circleCommand,
  git: githubCommand,
  github: githubCommand,
  sc: scriptCommand,
  script: scriptCommand,
  repo: scriptCommand,

  // Text maker
  metallic: metallicCommand,
  ice: iceCommand,
  snow: snowCommand,
  impressive: impressiveCommand,
  matrix: matrixCommand,
  light: lightCommand,
  neon: neonCommand,
  devil: devilCommand,
  purple: purpleCommand,
  thunder: thunderCommand,
  leaves: leavesCommand,
  '1917': year1917Command,
  arena: arenaCommand,
  hacker: hackerCommand,
  sand: sandCommand,
  blackpink: blackpinkCommand,
  glitch: glitchCommand,
  fire: fireCommand,
  attp: attpCommand,
};

// ─── Route command ────────────────────────────────────────────────
export async function routeCommand(sock, msg, params) {
  const { command } = params;
  const handler = commands[command];
  if (!handler) return; // unknown command
  try {
    await handler(sock, msg, params);
  } catch (err) {
    console.error(`[CMD ERROR] .${command}:`, err.message);
    try {
      await sock.sendMessage(params.jid, {
        text: `❌ Error executing command: ${err.message}`
      }, { quoted: msg });
    } catch {}
  }
}
