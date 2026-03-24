const express = require('express');
const multer = require('multer');
const { analyze, getHistory } = require('../controllers/analysisController');
const verifyToken = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post('/analyze', verifyToken, upload.single("file"), (req, res, next) => {
  // If no file, validate body for text
  if (!req.file) {
    return validate(schemas.analysis.textOnly)(req, res, next);
  } else {
    // If file exists, validate other optional fields
    return validate(schemas.analysis.fileOptions)(req, res, next);
  }
}, analyze);

router.get('/history', verifyToken, getHistory);

module.exports = router;
