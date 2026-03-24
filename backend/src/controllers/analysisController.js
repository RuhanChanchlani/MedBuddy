const fs = require('fs');
const { extractText, aiService } = require('../services/aiService');
const Prescription = require('../models/Prescription');
const logger = require('../utils/logger');

const analyze = async (req, res) => {
  try {
    let text = "";
    let result = null;
    const { age, language } = req.body;
    const options = { age, language };

    if (req.file) {
      const filePath = req.file.path;
      const mimeType = req.file.mimetype;
      
      logger.info(`Analyzing file: ${req.file.originalname} (${mimeType}) with options:`, options);

      if (mimeType.startsWith("image/")) {
        result = await aiService(null, options, filePath, mimeType);
      } else {
        text = await extractText(filePath, mimeType);
        result = await aiService(text, options);
      }
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } else if (req.body.text) {
      logger.info('Analyzing text input with options:', options);
      text = req.body.text;
      result = await aiService(text, options);
    } else {
      logger.warn('Analysis request failed: No file or text provided');
      return res.status(400).json({ error: "No file or text provided" });
    }

    await Prescription.create({
      userId: req.user.id,
      originalText: text || "Image content",
      result
    });

    logger.info(`Analysis completed successfully for user ${req.user.sub}`);
    res.json(result);
  } catch (err) {
    logger.error(`Analysis process failed: ${err.message}`);
    res.status(500).json({ error: "Processing failed", details: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    logger.info(`Fetching history for user ${req.user.sub}`);
    const data = await Prescription.findByUserId(req.user.id);
    const history = data.map(item => item.result);
    res.json(history);
  } catch (err) {
    logger.error(`Failed to fetch history for user ${req.user.sub}: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

module.exports = { analyze, getHistory };
