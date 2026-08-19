// public/js/auth.js
// Powers index.html — the login/register page.
// If a valid session already exists, skip straight to the dashboard.

if (getToken()) {
  window.location.href = '/dashboard.html';
}

function showTab(tab) {
  const isLogin = tab === 'login';

  document.getElementById('loginTabBtn').classList.toggle('active', isLogin);
  document.getElementById('registerTabBtn').classList.toggle('active', !isLogin);
  document.getElementById('loginPanel').classList.toggle('active', isLogin);
  document.getElementById('registerPanel').classList.toggle('active', !isLogin);
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    setSession(data.token, data.user);
    window.location.href = '/dashboard.html';
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('registerError');
  errorEl.textContent = '';

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password }
    });
    setSession(data.token, data.user);
    window.location.href = '/dashboard.html';
  } catch (err) {
    errorEl.textContent = err.message;
  }
});
