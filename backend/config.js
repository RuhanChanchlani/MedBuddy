require('dotenv').config();

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  AI_MODEL: process.env.AI_MODEL || 'anthropic', // priority: anthropic -> groq -> gemini
  AUTH_EXPIRY: '24h'
};
