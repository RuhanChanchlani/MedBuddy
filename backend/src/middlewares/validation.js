const Joi = require('joi');
const logger = require('../utils/logger');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    logger.warn(`Validation failed: ${errorMessage}`);
    return res.status(400).json({ status: 'error', message: errorMessage });
  }

  req.body = value;
  next();
};

const schemas = {
  auth: {
    register: Joi.object({
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    }),
    login: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required()
    })
  },
  analysis: {
    textOnly: Joi.object({
      text: Joi.string().min(10).required(),
      age: Joi.number().optional(),
      language: Joi.string().valid('English', 'Hindi').optional()
    }),
    fileOptions: Joi.object({
      age: Joi.number().optional(),
      language: Joi.string().valid('English', 'Hindi').optional()
    }).unknown()
  }
};

module.exports = { validate, schemas };
