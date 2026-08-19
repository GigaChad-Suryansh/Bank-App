# Wallet Test API

A small Node.js + Express backend to practice the basics of a real backend:
authentication (JWT), password hashing, protected routes, and a fake-money
wallet with deposit/withdraw/transaction-history.

No real database required — everything is stored in a local JSON file
(`data/db.json`) using `lowdb`, so you can open it and literally read your
"database" as plain JSON while you learn.

## Features

- Create an account (`/api/auth/register`)
- Login (`/api/auth/login`)
- Logout (`/api/auth/logout`)
- View profile (`/api/profile`)
- View balance (`/api/balance`)
- Deposit fake money (`/api/deposit`)
- Withdraw fake money (`/api/withdraw`)
- View transaction history (`/api/transactions`)

## Tech

- Express — web server / routing
- bcryptjs — password hashing
- jsonwebtoken — auth tokens
- lowdb — JSON-file storage (swap for a real DB later once you're comfortable)
- uuid — generating IDs

## Setup

```bash
git clone <your-repo-url>
cd wallet-app
npm install
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` to any long random string.

```bash
npm start
```

Server runs at `http://localhost:3000`.

## API Reference

All request/response bodies are JSON. Protected routes require:
`Authorization: Bearer <token>`

### POST /api/auth/register
```json
{ "name": "Suryansh", "email": "you@example.com", "password": "secret123" }
```
Returns a token + user object. Password must be at least 6 characters.

### POST /api/auth/login
```json
{ "email": "you@example.com", "password": "secret123" }
```
Returns a token + user object.

### POST /api/auth/logout  🔒
No body needed. Invalidates the token you sent (server-side blacklist),
so it can't be reused even before it expires.

### GET /api/profile  🔒
Returns `{ id, name, email, createdAt }`.

### GET /api/balance  🔒
Returns `{ balance }`.

### POST /api/deposit  🔒
```json
{ "amount": 500 }
```
Adds fake money to your balance, returns new balance + the transaction.

### POST /api/withdraw  🔒
```json
{ "amount": 200 }
```
Subtracts from your balance (rejects if amount > balance).

### GET /api/transactions  🔒
Returns `{ count, transactions }`, most recent first. Each transaction has
`{ id, userId, type, amount, balanceAfter, createdAt }`.

## How auth works here (for learning)

1. On register/login, the server signs a JWT containing your `userId` and
   `email`, using `JWT_SECRET`.
2. You send that token in the `Authorization: Bearer <token>` header on
   every protected request.
3. `src/middleware/auth.js` verifies the token's signature and expiry.
4. Because JWTs are stateless (the server doesn't normally "remember" them),
   logout is implemented by keeping a small blacklist of tokens that have
   been explicitly logged out — so a logged-out token stops working even
   though it hasn't expired yet.

## Next steps to try once this feels easy

- Swap `lowdb` for a real database (SQLite with `better-sqlite3`, or Postgres)
- Add refresh tokens instead of one long-lived token
- Add input validation with a library like `zod`
- Rate-limit the login route
- Write some automated tests with `jest` + `supertest`

## Project structure

```
wallet-app/
├── server.js              # entry point, wires everything up
├── src/
│   ├── db.js               # JSON-file "database"
│   ├── middleware/
│   │   └── auth.js         # JWT verification middleware
│   └── routes/
│       ├── auth.js         # register, login, logout
│       └── wallet.js       # profile, balance, deposit, withdraw, transactions
├── data/db.json             # created automatically on first run (gitignored)
├── .env.example
└── package.json
```
