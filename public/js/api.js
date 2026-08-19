// public/js/api.js
// Small helper so every page talks to the backend the same way.
// Since the frontend is served BY the same Express app, we can use
// relative paths like '/api/...' — no need to hardcode a host.

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

// Wrapper around fetch that adds the Authorization header automatically
// for protected endpoints, and throws a readable error on failure.
async function apiRequest(path, { method = 'GET', body = null, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (!token) {
      window.location.href = '/index.html';
      return;
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // If the token is dead (expired/blacklisted), boot back to login.
    if (res.status === 401 && auth) {
      clearSession();
      window.location.href = '/index.html';
    }
    throw new Error(data.error || 'Something went wrong.');
  }

  return data;
}
