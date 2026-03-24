const Joi = require('joi');
const logger = require('../utils/logger');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(8000),
  JWT_SECRET: Joi.string().required().description('Secret for JWT token generation'),
  GENAI_API_KEY: Joi.string().optional().description('API Key for Google Gemini'),
  OPENAI_API_KEY: Joi.string().optional().description('API Key for OpenAI'),
  MONGO_URI: Joi.string().optional() // SQLite is being used by default
}).or('GENAI_API_KEY', 'OPENAI_API_KEY').unknown();

const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env);

  if (error) {
    logger.error(`Config validation error: ${error.message}`);
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
};

module.exports = validateEnv;
