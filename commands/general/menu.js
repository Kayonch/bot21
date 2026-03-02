import { reply } from '../lib/utils.js';
import { config } from '../config/config.js';
import { runtime } from '../lib/utils.js';

const startTime = Date.now();

export async function menuCommand(sock, msg, { pushName }) {
  const p = config.prefix;
  const uptime = runtime(startTime);

  const menu = `☉
│╭═✦〔 *${config.botName}*〕✦═╮
││👤 ᴏᴡɴᴇʀ  : ${config.ownerName}
││🌍 ᴍᴏᴅᴇ   : 👥 ${config.mode === 'public' ? 'Public' : 'Private'}
││🔄 ᴜᴘᴛɪᴍᴇ : ${uptime}
││🛠️ ᴘʀᴇꜰɪx  : [ ${p} ]
││👑 ᴅᴇᴠ     : *${config.devName}*
││🚀 ᴠᴇʀsɪᴏɴ : *${config.version}*
│╰═══⭘═══════════⚬═╯
│ 
╰═✦ Hello 👋, *${pushName}* !!

│╭═✦〔🌐 *ɢᴇɴᴇʀᴀʟ ᴄᴍᴅꜱ* 〕✦═╮
││🔹 ${p}menu │ ${p}ping │ ${p}alive
││🔹 ${p}bible <verse> │ ${p}biblelist
││🔹 ${p}cinfo <country> │ ${p}epl
││🔹 ${p}tts <text> │ ${p}define <word>
││🔹 ${p}quote │ ${p}fact │ ${p}joke
││🔹 ${p}weather <city> │ ${p}news
││🔹 ${p}trt <text> <lang> │ ${p}8ball
││🔹 ${p}lyrics <song> │ ${p}ss <link>
│╰═══⭘═══════════⚬═╯

│╭═✦〔👮 *ᴀᴅᴍɪɴ ᴄᴍᴅꜱ* 〕✦═╮
││🔹 ${p}ban │ ${p}kick │ ${p}promote │ ${p}demote
││🔹 ${p}mute │ ${p}unmute │ ${p}delete
││🔹 ${p}warn │ ${p}warnings │ ${p}tag
││🔹 ${p}tagall │ ${p}antilink │ ${p}antibadword
││🔹 ${p}welcome │ ${p}goodbye │ ${p}chatbot
││🔹 ${p}setgname │ ${p}setgdesc │ ${p}setgpp
│╰═══⭘═══════════⚬═╯

│╭═✦〔🔒 *ᴏᴡɴᴇʀ ᴄᴍᴅꜱ* 〕✦═╮
││🔹 ${p}mode │ ${p}block │ ${p}unblock
││🔹 ${p}autostatus │ ${p}autotyping
││🔹 ${p}autorecording │ ${p}autoread
││🔹 ${p}anticall │ ${p}antidelete
││🔹 ${p}pmblocker │ ${p}settings
│╰═══⭘═══════════⚬═╯

│╭═✦〔🎨 *ɪᴍɢ/ꜱᴛᴋʀ ᴄᴍᴅꜱ* 〕✦═╮
││🔹 ${p}sticker │ ${p}simage │ ${p}blur
││🔹 ${p}removebg │ ${p}remini │ ${p}crop
││🔹 ${p}meme │ ${p}emojimix
│╰═══⭘═══════════⚬═╯

│╭═✦〔🤖 *ᴀɪ ᴄᴍᴅꜱ* 〕✦═╮
││🔹 ${p}gpt <q> │ ${p}gemini <q>
││🔹 ${p}imagine <prompt> │ ${p}flux <prompt>
││🔹 ${p}llama3 <q>
│╰═══⭘═══════════⚬═╯

│╭═✦〔🎮 *ɢᴀᴍᴇ ᴄᴍᴅꜱ* 〕✦═╮
││🔹 ${p}tictactoe │ ${p}hangman
││🔹 ${p}trivia │ ${p}truth │ ${p}dare
│╰═══⭘═══════════⚬═╯

│╭═✦〔📥 *ᴅᴏᴡɴʟᴏᴀᴅ ᴄᴍᴅꜱ* 〕✦═╮
││🔹 ${p}play <song> │ ${p}song <song>
││🔹 ${p}video <name> │ ${p}ytmp4 <link>
││🔹 ${p}tiktok │ ${p}instagram │ ${p}facebook
│╰═══⭘═══════════⚬═╯

│╭═✦〔🎯 *ꜰᴜɴ ᴄᴍᴅꜱ* 〕✦═╮
││🔹 ${p}compliment │ ${p}insult │ ${p}flirt
││🔹 ${p}hack │ ${p}ship │ ${p}simp
││🔹 ${p}wasted │ ${p}character
│╰═══⭘═══════════⚬═╯

│╭═✦〔🦠 *ʙᴜɢ ᴄᴍᴅꜱ* _premium_〕✦═╮
││🔹 ${p}crush │ ${p}kill │ ${p}218
│╰═══⭘═══════════⚬═╯

╰═✦ *Type ${p}allmenu for full list*`;

  return reply(sock, msg, menu);
}
