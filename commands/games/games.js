import { reply, fetchJson } from '../lib/utils.js';
import { config } from '../config/config.js';
import { games } from '../lib/store.js';

// ─── Tic Tac Toe ─────────────────────────────────────────────────
function renderBoard(board) {
  const s = ['1','2','3','4','5','6','7','8','9'];
  const b = board.map((v, i) => v || s[i]);
  return `╔═══╦═══╦═══╗
║ ${b[0]} ║ ${b[1]} ║ ${b[2]} ║
╠═══╬═══╬═══╣
║ ${b[3]} ║ ${b[4]} ║ ${b[5]} ║
╠═══╬═══╬═══╣
║ ${b[6]} ║ ${b[7]} ║ ${b[8]} ║
╚═══╩═══╩═══╝`;
}

function checkWinner(b) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,c,d] of wins) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  if (b.every(v => v)) return 'draw';
  return null;
}

export async function tictactoeCommand(sock, msg, { jid, sender, mentionedJid, text }) {
  // Start game
  const game = games.get(jid);
  if (!game) {
    if (!mentionedJid.length) return reply(sock, msg, `❓ Usage: ${config.prefix}tictactoe @user`);
    const opponent = mentionedJid[0];
    if (opponent === sender) return reply(sock, msg, '❌ You can\'t play against yourself!');
    games.set(jid, {
      board: Array(9).fill(null),
      players: { X: sender, O: opponent },
      turn: 'X'
    });
    return sock.sendMessage(jid, {
      text: `🎮 *Tic Tac Toe Started!*\n\n❌ X: @${sender.replace('@s.whatsapp.net','')}\n⭕ O: @${opponent.replace('@s.whatsapp.net','')}\n\n${renderBoard(Array(9).fill(null))}\n\n@${sender.replace('@s.whatsapp.net','')} goes first! Type 1-9 to place`,
      mentions: [sender, opponent]
    }, { quoted: msg });
  }
  // Make move
  const pos = parseInt(text) - 1;
  if (isNaN(pos) || pos < 0 || pos > 8) return reply(sock, msg, '❌ Enter a number 1-9');
  if (game.players[game.turn] !== sender) return reply(sock, msg, `❌ It's not your turn!`);
  if (game.board[pos]) return reply(sock, msg, '❌ That spot is taken!');
  game.board[pos] = game.turn;
  const winner = checkWinner(game.board);
  const board = renderBoard(game.board);
  if (winner === 'draw') {
    games.del(jid);
    return reply(sock, msg, `${board}\n\n🤝 *It's a draw!*`);
  }
  if (winner) {
    const winnerJid = game.players[winner];
    games.del(jid);
    return sock.sendMessage(jid, {
      text: `${board}\n\n🏆 @${winnerJid.replace('@s.whatsapp.net','')} wins! Congratulations! 🎉`,
      mentions: [winnerJid]
    }, { quoted: msg });
  }
  game.turn = game.turn === 'X' ? 'O' : 'X';
  const nextPlayer = game.players[game.turn];
  return sock.sendMessage(jid, {
    text: `${board}\n\n@${nextPlayer.replace('@s.whatsapp.net','')} your turn (${game.turn === 'X' ? '❌' : '⭕'})`,
    mentions: [nextPlayer]
  }, { quoted: msg });
}

// ─── Hangman ─────────────────────────────────────────────────────
const hangmanWords = ['elephant','programming','javascript','whatsapp','beautiful','geography','adventure','chocolate','butterfly','president'];
const hangPics = ['😀','😅','😨','😰','😱','☠️'];

export async function hangmanCommand(sock, msg, { jid }) {
  const word = hangmanWords[Math.floor(Math.random() * hangmanWords.length)];
  games.set(`hangman_${jid}`, {
    word,
    guessed: [],
    wrong: 0,
    maxWrong: 5
  });
  const display = word.split('').map(() => '_').join(' ');
  return reply(sock, msg,
`🎯 *Hangman Started!*

${hangPics[0]} Lives: 5/5
Word: ${display}
Wrong guesses: none

Type ${config.prefix}guess <letter> to guess!`
  );
}

export async function guessCommand(sock, msg, { jid, args }) {
  const game = games.get(`hangman_${jid}`);
  if (!game) return reply(sock, msg, `❌ No hangman game active! Start with ${config.prefix}hangman`);
  const letter = args[0]?.toLowerCase();
  if (!letter || !/^[a-z]$/.test(letter)) return reply(sock, msg, '❌ Enter a single letter!');
  if (game.guessed.includes(letter)) return reply(sock, msg, `❌ Already guessed "${letter}"!`);
  game.guessed.push(letter);
  if (!game.word.includes(letter)) game.wrong++;
  const display = game.word.split('').map(l => game.guessed.includes(l) ? l : '_').join(' ');
  const lives = game.maxWrong - game.wrong;
  const won = game.word.split('').every(l => game.guessed.includes(l));
  if (won) {
    games.del(`hangman_${jid}`);
    return reply(sock, msg, `🎉 *You won!*\nThe word was: *${game.word}*`);
  }
  if (game.wrong > game.maxWrong) {
    games.del(`hangman_${jid}`);
    return reply(sock, msg, `☠️ *Game Over!*\nThe word was: *${game.word}*`);
  }
  return reply(sock, msg,
`${hangPics[game.wrong]} Lives: ${lives}/${game.maxWrong}
Word: ${display}
Wrong guesses: ${game.guessed.filter(l => !game.word.includes(l)).join(', ') || 'none'}`
  );
}

// ─── Trivia ──────────────────────────────────────────────────────
export async function triviaCommand(sock, msg, { jid }) {
  try {
    const data = await fetchJson('https://opentdb.com/api.php?amount=1&type=multiple');
    const q = data.results[0];
    const allAnswers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
    const labels = ['A', 'B', 'C', 'D'];
    const correctLabel = labels[allAnswers.indexOf(q.correct_answer)];
    games.trivia.set(jid, { correct: correctLabel, answer: q.correct_answer });
    let text = `🧩 *Trivia Time!*\n\n`;
    text += `📚 Category: ${q.category}\n`;
    text += `❓ ${q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'")}\n\n`;
    allAnswers.forEach((a, i) => {
      text += `${labels[i]}. ${a.replace(/&quot;/g, '"')}\n`;
    });
    text += `\nType ${config.prefix}answer <A/B/C/D> to answer!`;
    return reply(sock, msg, text);
  } catch {
    return reply(sock, msg, '❌ Could not fetch trivia. Try again!');
  }
}

export async function answerCommand(sock, msg, { jid, args }) {
  const game = games.trivia.get(jid);
  if (!game) return reply(sock, msg, `❌ No trivia active! Start with ${config.prefix}trivia`);
  const ans = args[0]?.toUpperCase();
  if (!['A','B','C','D'].includes(ans)) return reply(sock, msg, '❌ Answer with A, B, C, or D');
  games.trivia.del(jid);
  if (ans === game.correct) {
    return reply(sock, msg, `✅ *Correct!* 🎉\nThe answer was: *${game.answer}*`);
  }
  return reply(sock, msg, `❌ *Wrong!*\nThe correct answer was: *${game.answer}* (${game.correct})`);
}

// ─── Truth or Dare ───────────────────────────────────────────────
const truths = [
  "What is your most embarrassing moment?",
  "Have you ever lied to your best friend?",
  "What is your biggest fear?",
  "Who was your first crush?",
  "What's the worst thing you've ever done?",
  "Have you ever cheated on a test?",
  "What's your biggest secret?",
  "What do you think about most before you sleep?",
  "Have you ever stolen anything?",
  "What's the most trouble you've gotten into?"
];

const dares = [
  "Send a voice note saying 'I love potatoes' in a dramatic voice",
  "Change your WhatsApp status to 'I am a genius' for 10 minutes",
  "Send the last photo in your gallery",
  "Tag someone and say something nice about them",
  "Do 10 push-ups and report back",
  "Text your crush 'Hey' right now",
  "Change your name to 'Silly Goose' for 5 minutes",
  "Send a selfie with the ugliest face you can make",
  "Write a 5-line poem about this group",
  "Call someone in this group and say 'I need to tell you something important' then stay silent"
];

export async function truthCommand(sock, msg) {
  const t = truths[Math.floor(Math.random() * truths.length)];
  return reply(sock, msg, `🤔 *Truth*\n\n${t}`);
}

export async function dareCommand(sock, msg) {
  const d = dares[Math.floor(Math.random() * dares.length)];
  return reply(sock, msg, `🎯 *Dare*\n\n${d}`);
}
