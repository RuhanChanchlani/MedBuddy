require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  AI_MODEL: process.env.AI_MODEL || 'gemini', // 'anthropic' or 'gemini'
  // Simulation-only settings
  AUTH_EXPIRY: '24h'
};
