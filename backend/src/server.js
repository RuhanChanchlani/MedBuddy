const dotenv = require('dotenv');
const { initDB } = require('./config/db');
const validateEnv = require('./config/env');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Validate Environment Variables
try {
  validateEnv();
} catch (err) {
  process.exit(1);
}

const app = require('./app');

// Initialize DB
initDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  logger.info(`✅ MedBuddy Production-Ready Backend Running on Port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Keep process alive
setInterval(() => {}, 1000000);
