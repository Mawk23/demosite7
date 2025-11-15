// Simple client JS for login and profile pages
// Validation helpers (client-side)
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\s|-|\(|\)/g, '');
}

function isValidPhone(phone) {
  if (!phone) return true;
  const normalized = normalizePhone(phone);
  return /^\+?[0-9]{7,15}$/.test(normalized);
}

function isValidDOB(dob) {
  if (!dob) return true;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  if (d > now) return false;
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) age--;
  return age >= 13;
}

async function api(path, opts = {}) {
  const token = localStorage.getItem('token');
  opts.headers = opts.headers || {};
  opts.headers['Content-Type'] = 'application/json';
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(path, opts);
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { }
  if (!res.ok) throw json || { status: res.status, text };
  return json;
}

// Login page logic
if (document.getElementById('loginBtn')) {
  const errorEl = document.getElementById('error');
  document.getElementById('loginBtn').addEventListener('click', async () => {
    errorEl.classList.add('hidden');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) {
      errorEl.textContent = 'Please enter username and password';
      errorEl.classList.remove('hidden');
      return;
    }
    try {
      const res = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      localStorage.setItem('token', res.token);
      window.location.href = '/profile.html';
    } catch (err) {
      errorEl.textContent = err && err.error ? err.error : 'Login failed';
      errorEl.classList.remove('hidden');
    }
  });
}

// Registration page logic
if (document.getElementById('registerBtn')) {
  const errorEl = document.getElementById('error');
  document.getElementById('registerBtn').addEventListener('click', async () => {
    errorEl.classList.add('hidden');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Client-side validation
    if (!username) {
      errorEl.textContent = 'Please enter a username';
      errorEl.classList.remove('hidden');
      return;
    }
    if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      errorEl.textContent = 'Username must be 3-30 alphanumeric characters (and underscore)';
      errorEl.classList.remove('hidden');
      return;
    }
    if (!password) {
      errorEl.textContent = 'Please enter a password';
      errorEl.classList.remove('hidden');
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters';
      errorEl.classList.remove('hidden');
      return;
    }
    if (!email) {
      errorEl.textContent = 'Please enter an email address';
      errorEl.classList.remove('hidden');
      return;
    }
    if (!validateEmail(email)) {
      errorEl.textContent = 'Please enter a valid email address';
      errorEl.classList.remove('hidden');
      return;
    }
    
    try {
      const res = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password, email }) });
      localStorage.setItem('token', res.token);
      window.location.href = '/profile.html';
    } catch (err) {
      errorEl.textContent = err && err.error ? err.error : 'Registration failed';
      errorEl.classList.remove('hidden');
    }
  });
}

// Profile page logic
if (document.getElementById('profileForm')) {
  const form = document.getElementById('profileForm');
  const msg = document.getElementById('msg');
  const who = document.getElementById('who');
  const logoutBtn = document.getElementById('logout');

  logoutBtn.addEventListener('click', () => { localStorage.removeItem('token'); window.location.href = '/'; });

  async function load() {
    try {
      const user = await api('/api/users/me');
      document.getElementById('username').value = user.username || '';
      document.getElementById('email').value = user.email || '';
      document.getElementById('phone').value = user.phone || '';
      if (user.dob) document.getElementById('dob').value = new Date(user.dob).toISOString().slice(0,10);
      who.textContent = user.username || '';
    } catch (err) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.classList.add('hidden');
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const dob = document.getElementById('dob').value;
    
    // Client-side validation
    if (email && !validateEmail(email)) {
      msg.textContent = 'Please enter a valid email address.';
      msg.classList.remove('hidden', 'success');
      msg.classList.add('error');
      return;
    }
    if (phone && !isValidPhone(phone)) {
      msg.textContent = 'Phone number must be 7-15 digits.';
      msg.classList.remove('hidden', 'success');
      msg.classList.add('error');
      return;
    }
    if (dob && !isValidDOB(dob)) {
      msg.textContent = 'Date of birth must be valid, in the past, and you must be at least 13 years old.';
      msg.classList.remove('hidden', 'success');
      msg.classList.add('error');
      return;
    }
    
    try {
      const updated = await api('/api/users/me', { method: 'PUT', body: JSON.stringify({ email, phone, dob }) });
      msg.textContent = 'Profile saved successfully.';
      msg.classList.remove('hidden', 'error');
      msg.classList.add('success');
    } catch (err) {
      const errorMsg = err && err.fieldErrors ? Object.values(err.fieldErrors)[0] : (err && err.message || err && err.error || 'Save failed');
      msg.textContent = errorMsg;
      msg.classList.remove('hidden', 'success');
      msg.classList.add('error');
    }
  });

  load();
}
