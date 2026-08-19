// src/routes/wallet.js
// Handles: profile, balance, deposit, withdraw, transaction history
// All routes here are protected — requireAuth runs first and sets req.user

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ---------- GET /api/profile ----------
router.get('/profile', (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  });
});

// ---------- GET /api/balance ----------
router.get('/balance', (req, res) => {
  const wallet = db.get('wallets').find({ userId: req.user.id }).value();
  if (!wallet) return res.status(404).json({ error: 'Wallet not found.' });

  return res.json({ balance: wallet.balance });
});

// ---------- POST /api/deposit ----------
router.post('/deposit', (req, res) => {
  const { amount } = req.body;
  const numAmount = Number(amount);

  if (!amount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number.' });
  }

  const wallet = db.get('wallets').find({ userId: req.user.id }).value();
  const newBalance = round2(wallet.balance + numAmount);

  db.get('wallets').find({ userId: req.user.id }).assign({ balance: newBalance }).write();

  const tx = recordTransaction(req.user.id, 'deposit', numAmount, newBalance);

  return res.status(201).json({
    message: 'Deposit successful.',
    balance: newBalance,
    transaction: tx
  });
});

// ---------- POST /api/withdraw ----------
router.post('/withdraw', (req, res) => {
  const { amount } = req.body;
  const numAmount = Number(amount);

  if (!amount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number.' });
  }

  const wallet = db.get('wallets').find({ userId: req.user.id }).value();

  if (numAmount > wallet.balance) {
    return res.status(400).json({ error: 'Insufficient balance.' });
  }

  const newBalance = round2(wallet.balance - numAmount);

  db.get('wallets').find({ userId: req.user.id }).assign({ balance: newBalance }).write();

  const tx = recordTransaction(req.user.id, 'withdraw', numAmount, newBalance);

  return res.status(201).json({
    message: 'Withdrawal successful.',
    balance: newBalance,
    transaction: tx
  });
});

// ---------- GET /api/transactions ----------
router.get('/transactions', (req, res) => {
  const transactions = db.get('transactions')
    .filter({ userId: req.user.id })
    .sortBy('createdAt')
    .reverse() // most recent first
    .value();

  return res.json({ count: transactions.length, transactions });
});

// ---------- helpers ----------
function recordTransaction(userId, type, amount, balanceAfter) {
  const tx = {
    id: uuidv4(),
    userId,
    type,
    amount: round2(amount),
    balanceAfter,
    createdAt: new Date().toISOString()
  };
  db.get('transactions').push(tx).write();
  return tx;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = router;
