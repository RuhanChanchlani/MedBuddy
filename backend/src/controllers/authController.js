const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const register = async (req, res) => {
  const { username, email, password } = req.body;
  
  const existing = User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    logger.warn(`Registration failed: User ${username} or email ${email} already exists`);
    return res.status(400).json({ error: "User or email exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = User.create({
    username,
    email,
    password: hashed
  });
  
  logger.info(`New user registered: ${username}`);
  res.json({ message: "User registered", id: user._id });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  
  const user = User.findOne({ username });
  if (!user) {
    logger.warn(`Login attempt failed: User ${username} not found`);
    return res.status(400).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    logger.warn(`Login attempt failed: Invalid password for user ${username}`);
    return res.status(400).json({ error: "Invalid password" });
  }

  const token = jwt.sign(
    { id: user._id, sub: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  logger.info(`User logged in: ${username}`);
  res.json({ access_token: token, token_type: "bearer" });
};

module.exports = { register, login };
