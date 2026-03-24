const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/error');
const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const { login } = require('./controllers/authController');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logging
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check / Root Route
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'MedBuddy API is running' });
});

// Routes
app.use('/api/v1', authRoutes);
app.use('/api/v1', analysisRoutes);
app.use('/api/v1/webhook', webhookRoutes);

// Special legacy endpoint for frontend token
app.post('/token', login);

// Error Handling
app.use(errorHandler);

module.exports = app;
