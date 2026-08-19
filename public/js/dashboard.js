// public/js/dashboard.js
// Powers dashboard.html — the logged-in view.

if (!getToken()) {
  window.location.href = '/index.html';
}

async function loadProfile() {
  const user = await apiRequest('/profile', { auth: true });
  document.getElementById('greeting').textContent = `Hi, ${user.name}`;
  document.getElementById('emailLine').textContent = user.email;
}

async function loadBalance() {
  const data = await apiRequest('/balance', { auth: true });
  document.getElementById('balanceAmount').textContent = formatCurrency(data.balance);
}

async function loadTransactions() {
  const data = await apiRequest('/transactions', { auth: true });
  const list = document.getElementById('txList');
  list.innerHTML = '';

  if (data.transactions.length === 0) {
    list.innerHTML = '<li class="empty-state">No transactions yet.</li>';
    return;
  }

  data.transactions.forEach((tx) => {
    const li = document.createElement('li');
    li.className = 'tx-item';

    const sign = tx.type === 'deposit' ? '+' : '−';
    const date = new Date(tx.createdAt).toLocaleString();

    li.innerHTML = `
      <div>
        <div class="tx-type ${tx.type}">${tx.type}</div>
        <div class="tx-meta">${date}</div>
      </div>
      <div>
        <div class="tx-type ${tx.type}">${sign} ${formatCurrency(tx.amount)}</div>
        <div class="tx-meta">Balance: ${formatCurrency(tx.balanceAfter)}</div>
      </div>
    `;
    list.appendChild(li);
  });
}

function formatCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function refreshAll() {
  await Promise.all([loadProfile(), loadBalance(), loadTransactions()]);
}

document.getElementById('depositForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('actionMsg');
  msg.textContent = '';
  const amountInput = document.getElementById('depositAmount');
  const amount = Number(amountInput.value);

  try {
    await apiRequest('/deposit', { method: 'POST', auth: true, body: { amount } });
    amountInput.value = '';
    await refreshAll();
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('actionMsg');
  msg.textContent = '';
  const amountInput = document.getElementById('withdrawAmount');
  const amount = Number(amountInput.value);

  try {
    await apiRequest('/withdraw', { method: 'POST', auth: true, body: { amount } });
    amountInput.value = '';
    await refreshAll();
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await apiRequest('/auth/logout', { method: 'POST', auth: true });
  } catch (err) {
    // even if this fails (e.g. token already expired), still clear locally
  }
  clearSession();
  window.location.href = '/index.html';
});

refreshAll().catch((err) => {
  console.error(err);
});
