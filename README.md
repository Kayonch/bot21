# 🤖 LTH Bot v2.2.6

> WhatsApp Bot for group management and DMs  
> 👑 Dev: Lucky218 | 🇺🇬 Uganda | 📺 Lucky Tech Hub

---

## ✨ Features

- 100+ commands across General, Admin, Owner, AI, Games, Downloads, Fun & more
- Works in **groups** AND **private/DM** chats
- Public/Private mode
- Anti-link, Anti-bad word, Anti-delete, Anti-call
- Welcome & Goodbye messages
- Auto Typing, Auto Read, Auto Recording indicators
- PM Blocker
- AI: GPT-3.5, Gemini, LLaMA3, Imagine (Stable Diffusion), Flux, Sora
- YouTube, TikTok, Instagram, Facebook downloader
- Tic Tac Toe, Hangman, Trivia
- Text effects (Fire, Ice, Neon, Matrix, Glitch, etc.)
- Bible verses, Country info, Weather, News, Lyrics, Translate, and more!

---

## 📦 Requirements

- **Node.js v18+** (download: https://nodejs.org)
- **npm** (comes with Node.js)
- A **WhatsApp account** (use a secondary number recommended)
- A smartphone to scan the QR code

---

## 🚀 Setup

### 1. Clone / download the bot

```bash
git clone https://github.com/Lucky218/lth-bot.git
cd lth-bot
```

Or just extract the folder if you downloaded it as a ZIP.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the bot

Edit the `.env` file:

```env
OWNER_NAME=YourName
OWNER_NUMBER=256700000000    # Your number WITHOUT + (include country code)
BOT_NAME=LTH Bot
PREFIX=.
BOT_MODE=public

# Add your API keys (get free keys from the links below)
WEATHER_API_KEY=xxx
NEWS_API_KEY=xxx
OPENAI_API_KEY=xxx
GEMINI_API_KEY=xxx
REMOVEBG_API_KEY=xxx
```

**Free API Keys:**
| Key | Get it at |
|-----|-----------|
| `WEATHER_API_KEY` | https://www.weatherapi.com (free) |
| `NEWS_API_KEY` | https://newsapi.org (free) |
| `OPENAI_API_KEY` | https://platform.openai.com |
| `GEMINI_API_KEY` | https://makersuite.google.com/app/apikey |
| `REMOVEBG_API_KEY` | https://www.remove.bg/api |
| `HF_TOKEN` (LLaMA3) | https://console.groq.com (free) |

> The bot works WITHOUT API keys — those commands just show a warning.

### 4. Start the bot

```bash
npm start
```

### 5. Scan the QR code

A QR code will appear in the terminal. Open WhatsApp on your phone:
- **Android:** Settings → Linked Devices → Link a Device
- **iPhone:** Settings → Linked Devices → Link a Device

Scan the QR code. The bot will connect and send you a message!

---

## 📋 All Commands

### 🌐 General
| Command | Description |
|---------|-------------|
| `.menu` | Show command menu |
| `.ping` | Check bot speed |
| `.alive` | Check bot status & uptime |
| `.weather <city>` | Get weather info |
| `.news` | Top news headlines |
| `.define <word>` | Dictionary definition |
| `.translate <text> <lang>` | Translate text (e.g., `.trt Hello es`) |
| `.joke` | Random joke |
| `.fact` | Random fact |
| `.quote` | Inspirational quote |
| `.8ball <question>` | Magic 8 ball |
| `.lyrics <song>` | Get song lyrics |
| `.bible <verse>` | Bible verse (e.g., `.bible John 3:16`) |
| `.cinfo <country>` | Country information |
| `.epl` | EPL standings |
| `.tts <text>` | Text to speech |
| `.ss <url>` | Screenshot a website |
| `.groupinfo` | Group information |
| `.admins` | List group admins |
| `.jid` | Show your JID |

### 👮 Admin (group admins only)
| Command | Description |
|---------|-------------|
| `.ban @user` | Remove user |
| `.kick @user` | Kick user |
| `.promote @user` | Make admin |
| `.demote @user` | Remove admin |
| `.mute <minutes>` | Mute group |
| `.unmute` | Unmute group |
| `.delete` | Delete replied message |
| `.warn @user` | Warn user (3 = auto-kick) |
| `.warnings @user` | Check warnings |
| `.tag <msg>` | Tag all members |
| `.tagall` | Tag everyone |
| `.antilink` | Toggle anti-link |
| `.antibadword` | Toggle anti-bad word |
| `.welcome on/off` | Toggle welcome messages |
| `.goodbye on/off` | Toggle goodbye messages |
| `.chatbot on/off` | Toggle AI chatbot in group |
| `.resetlink` | Reset invite link |
| `.setgname <name>` | Change group name |
| `.setgdesc <desc>` | Change group description |
| `.setgpp` | Change group photo |

### 🔒 Owner only
| Command | Description |
|---------|-------------|
| `.mode public/private` | Change bot mode |
| `.block @user` | Block user |
| `.unblock @user` | Unblock user |
| `.settings` | View bot settings |
| `.autostatus on/off` | Auto view status |
| `.autotyping on/off` | Show typing indicator |
| `.autorecording on/off` | Show recording indicator |
| `.autoread on/off` | Auto read messages |
| `.anticall on/off` | Block incoming calls |
| `.antidelete on/off` | Show deleted messages |
| `.pmblocker on/off` | Block unknown DMs |
| `.setpp` | Set bot profile picture |

### 🤖 AI
| Command | Description |
|---------|-------------|
| `.gpt <q>` | Ask GPT-3.5 |
| `.gemini <q>` | Ask Google Gemini |
| `.lucky <q>` | Ask Lucky AI (free) |
| `.llama3 <q>` | Ask LLaMA 3 |
| `.imagine <prompt>` | Generate AI image |
| `.flux <prompt>` | Flux image generation |
| `.sora <prompt>` | Sora-style image |

### 🎮 Games
| Command | Description |
|---------|-------------|
| `.tictactoe @user` | Play tic tac toe |
| `.hangman` | Start hangman game |
| `.guess <letter>` | Guess hangman letter |
| `.trivia` | Trivia question |
| `.answer <A/B/C/D>` | Answer trivia |
| `.truth` | Truth question |
| `.dare` | Dare challenge |

### 📥 Downloads
| Command | Description |
|---------|-------------|
| `.play <song>` | Download audio from YouTube |
| `.video <title>` | Download video from YouTube |
| `.ytmp4 <link>` | Download YouTube video by URL |
| `.tiktok <link>` | Download TikTok |
| `.instagram <link>` | Download Instagram |
| `.facebook <link>` | Download Facebook video |
| `.spotify <song>` | Download Spotify-style audio |
| `.apk <name>` | Search Play Store |

### 🎯 Fun
| Command | Description |
|---------|-------------|
| `.compliment @user` | Send compliment |
| `.insult @user` | Send insult |
| `.flirt` | Random flirt |
| `.hack @user` | Fake hack animation |
| `.ship @user` | Compatibility check |
| `.simp @user` | Simp percentage |
| `.character @user` | Spirit animal/character |
| `.wasted @user` | GTA-style wasted |
| `.shayari` | Urdu/Hindi shayari |
| `.goodnight` | Goodnight message |
| `.truth` | Truth question |
| `.dare` | Dare challenge |

### 🎨 Images & Stickers
| Command | Description |
|---------|-------------|
| `.sticker` | Image → sticker |
| `.simage` | Sticker → image |
| `.blur` | Blur an image |
| `.removebg` | Remove background |
| `.meme` | Random meme |
| `.emojimix 😂+😭` | Mix two emojis |
| `.vv` | Reveal view-once media |
| `.neko / .waifu` | Anime images |
| `.hug / .kiss / .pat` | Anime reactions |

### 🔤 Text Effects
`.fire`, `.ice`, `.neon`, `.matrix`, `.glitch`, `.hacker`, `.metallic`, `.snow`, `.devil`, `.thunder`, `.purple`, `.leaves`, `.arena`, `.blackpink`, `.sand`, `.light`, `.impressive`, `.1917`

---

## 🛠️ Project Structure

```
lth-bot/
├── index.js              # Main entry point
├── .env                  # Configuration
├── config/
│   └── config.js         # Config loader
├── lib/
│   ├── utils.js          # Helper functions
│   ├── store.js          # Data persistence
│   ├── events.js         # Event handlers
│   └── router.js         # Command router
├── commands/
│   ├── general/          # General commands
│   ├── admin/            # Admin commands
│   ├── owner/            # Owner commands
│   ├── ai/               # AI commands
│   ├── games/            # Game commands
│   ├── download/         # Download commands
│   ├── fun/              # Fun commands
│   └── media/            # Media/sticker/textmaker
├── session/              # WhatsApp session (auto-created)
└── data/                 # Persistent data (auto-created)
```

---

## ⚠️ Troubleshooting

**Bot won't connect?**
- Make sure Node.js v18+ is installed: `node --version`
- Delete the `session/` folder and restart

**Commands not working?**
- Check you're using the correct prefix (default: `.`)
- For admin commands, make sure you're a group admin
- For owner commands, make sure your number matches `OWNER_NUMBER` in `.env`

**Downloads failing?**
- Free API endpoints may have rate limits — try again in a moment
- Very long videos may fail — try shorter ones

---

## 📺 Credits

- **Developer:** Lucky218
- **YouTube:** Lucky Tech Hub
- **Country:** Uganda 🇺🇬
- **Library:** [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)

---

> ⭐ If you like this bot, star the repo and subscribe to Lucky Tech Hub!
