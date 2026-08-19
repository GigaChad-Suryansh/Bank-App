require('dotenv').config();
const path = require('path');
const express = require('express');

const authRoutes = require('./src/routes/auth');
const walletRoutes = require('./src/routes/wallet');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the frontend (public/index.html, dashboard.html, css/, js/)
app.use(express.static(path.join(__dirname, 'public')));

// Simple request logger — handy while testing in Postman/curl
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api', walletRoutes); // /api/profile, /api/balance, /api/deposit, /api/withdraw, /api/transactions

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Generic error handler (catches anything thrown synchronously in routes)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
