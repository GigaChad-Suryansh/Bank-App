// src/middleware/auth.js
// Protects routes by requiring a valid JWT in the Authorization header.
// Usage: Authorization: Bearer <token>

const jwt = require('jsonwebtoken');
const db = require('../db');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header. Expected: Bearer <token>' });
  }

  // If the token was "logged out", reject it even if it's still technically valid.
  const isBlacklisted = db.get('blacklistedTokens').includes(token).value();
  if (isBlacklisted) {
    return res.status(401).json({ error: 'Token has been logged out. Please login again.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, email: payload.email };
    req.token = token; // stash raw token in case a route needs it (e.g. logout)
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = requireAuth;
