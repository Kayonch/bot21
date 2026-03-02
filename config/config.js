import dotenv from 'dotenv';
dotenv.config();

export const config = {
  ownerName: process.env.OWNER_NAME || 'Ethane',
  ownerNumber: process.env.OWNER_NUMBER || '256700000000',
  botName: process.env.BOT_NAME || 'LTH Bot',
  prefix: process.env.PREFIX || '.',
  version: process.env.BOT_VERSION || '2.2.6',
  devName: process.env.DEV_NAME || 'Lucky218',
  mode: process.env.BOT_MODE || 'public', // 'public' or 'private'
  sessionFolder: process.env.SESSION_FOLDER || './session',

  // API Keys
  openaiKey: process.env.OPENAI_API_KEY || '',
  geminiKey: process.env.GEMINI_API_KEY || '',
  weatherKey: process.env.WEATHER_API_KEY || '',
  newsKey: process.env.NEWS_API_KEY || '',
  removebgKey: process.env.REMOVEBG_API_KEY || '',
  rapidapiKey: process.env.RAPIDAPI_KEY || '',
  hfToken: process.env.HF_TOKEN || '',

  // Feature toggles (can be changed at runtime too)
  features: {
    antiLink: process.env.ANTI_LINK === 'true',
    antiBadWord: process.env.ANTI_BAD_WORD === 'true',
    welcomeMsg: process.env.WELCOME_MSG !== 'false',
    goodbyeMsg: process.env.GOODBYE_MSG !== 'false',
    antiDelete: process.env.ANTI_DELETE === 'true',
    autoStatus: process.env.AUTO_STATUS === 'true',
    autoTyping: process.env.AUTO_TYPING === 'true',
    autoRecording: process.env.AUTO_RECORDING === 'true',
    autoRead: process.env.AUTO_READ === 'true',
    antiCall: process.env.ANTI_CALL === 'true',
    chatbot: process.env.CHATBOT === 'true',
    antiTag: false,
  }
};

// Bad words list
export const badWords = ['badword1', 'badword2']; // Add your own

// Premium users list
export const premiumUsers = [
  // Add premium user JIDs here: '254700000000@s.whatsapp.net'
];
