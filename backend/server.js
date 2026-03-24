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
app.listen(config.PORT, () => {
  console.log(`MedBuddy Backend running on port ${config.PORT}`);
  if (!config.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set in environment variables!');
  }
});
