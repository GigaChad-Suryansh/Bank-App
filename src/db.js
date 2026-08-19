// src/db.js
// Very simple JSON-file "database" using lowdb.
// Good enough for learning/testing — NOT meant for production use.
// Everything lives in data/db.json, so you can literally open it and read it.

const fs = require('fs');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const dataDir = path.join(__dirname, '..', 'data');
const dbFile = path.join(dataDir, 'db.json');

// git doesn't track empty folders, and data/db.json is gitignored, so on a
// fresh clone / fresh deploy the whole "data" folder may not exist yet.
// Create it ourselves so lowdb always has somewhere to write.
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const adapter = new FileSync(dbFile);
const db = low(adapter);

// Shape of our "database":
// {
//   users: [ { id, name, email, passwordHash, createdAt } ],
//   wallets: [ { userId, balance } ],
//   transactions: [ { id, userId, type: 'deposit'|'withdraw', amount, balanceAfter, createdAt } ],
//   blacklistedTokens: [ "jwt-token-string", ... ]  // used for logout
// }
db.defaults({
  users: [],
  wallets: [],
  transactions: [],
  blacklistedTokens: []
}).write();

module.exports = db;
