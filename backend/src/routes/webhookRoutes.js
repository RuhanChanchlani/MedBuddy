const express = require('express');
const { aiService } = require('../services/aiService');

const router = express.Router();

router.post('/github', async (req, res) => {
  console.log("Received GitHub Webhook:", req.body);
  res.json({ status: "success", source: "github" });
});

router.post('/n8n', async (req, res) => {
  const payload = req.body;
  console.log("Received n8n Webhook Payload:", JSON.stringify(payload, null, 2));

  if (payload.medicalText) {
    try {
      const result = await aiService(payload.medicalText);
      console.log("n8n Triggered Analysis Result:", result.diagnosis);
      return res.json({ 
        status: "success", 
        message: "Analysis completed via n8n trigger",
        analysis: result 
      });
    } catch (err) {
      console.error("n8n Analysis Error:", err);
      return res.status(500).json({ error: "Analysis failed" });
    }
  }

  res.json({ 
    status: "success", 
    message: "Webhook received by MedBuddy",
    receivedData: payload 
  });
});

module.exports = router;
