const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', routes);

// Start server
const server = app.listen(config.PORT, '0.0.0.0', () => {
  console.log('-------------------------------------------');
  console.log(`🚀 MedBuddy Backend: http://localhost:${config.PORT}`);
  console.log(`🤖 AI Model: ${config.AI_MODEL.toUpperCase()}`);
  console.log('-------------------------------------------');
  
  if (!config.GEMINI_API_KEY && config.AI_MODEL === 'gemini') {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is not set!');
  }
});

// Keep process alive
setInterval(() => {}, 1000 * 60 * 60);
