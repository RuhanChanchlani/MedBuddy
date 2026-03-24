const express = require('express');
const router = express.Router();
const authService = require('./authService');
const aiService = require('./aiService');

// --- Auth Routes ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.signup(name, email, password);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- AI Routes ---
router.post('/analyze', async (req, res) => {
  try {
    const { text, fileData, fileType, lang, age, docType } = req.body;
    const result = await aiService.analyzeDocument(text, fileData, fileType, lang, age, docType);
    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed.' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { messages, docContext } = req.body;
    const reply = await aiService.chatWithBot(messages, docContext);
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed.' });
  }
});

module.exports = router;
