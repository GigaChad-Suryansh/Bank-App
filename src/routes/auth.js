// src/routes/auth.js
// Handles: create account, login, logout

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ---------- helpers ----------
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

// ---------- POST /api/auth/register ----------
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are all required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.get('users').find({ email: email.toLowerCase() }).value();
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const user = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  };

  db.get('users').push(user).write();

  // Every new user starts a wallet with a 0 balance of fake money.
  db.get('wallets').push({ userId: user.id, balance: 0 }).write();

  const token = signToken(user);

  return res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// ---------- POST /api/auth/login ----------
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  const user = db.get('users').find({ email: String(email).toLowerCase() }).value();
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const passwordMatches = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);

  return res.json({
    message: 'Logged in successfully.',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// ---------- POST /api/auth/logout ----------
// JWTs are stateless, so "logging out" server-side means we blacklist
// the specific token that was used, so it can't be reused even though
// it hasn't technically expired yet.
router.post('/logout', requireAuth, (req, res) => {
  db.get('blacklistedTokens').push(req.token).write();
  return res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
