require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  // Simulation-only settings
  AUTH_EXPIRY: '24h'
};
