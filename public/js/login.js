/* Razan Saad 322391103, Mayar Ghanem 213380694 */
/* Login/register page script (no inline JS) */

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    document.getElementById('message').innerText = 'Please fill all fields';
    return;
  }

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(data => {
    if (data.success) {
      window.location.href = '/main.html';
    } else {
      document.getElementById('message').innerText = 'Login failed';
    }
  })
  .catch(() => {
    document.getElementById('message').innerText = 'Network error. Try again.';
  });
}

function registerUser() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    document.getElementById('message').innerText = 'Please fill all fields';
    return;
  }

  fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(data => {
    document.getElementById('message').innerText =
      data.success ? 'Registration successful. Please login.' : (data.message || 'Registration failed');
  })
  .catch(() => {
    document.getElementById('message').innerText = 'Network error. Try again.';
  });
}

// Attach listeners (no inline handlers in HTML)
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (loginBtn)    loginBtn.addEventListener('click', login);
  if (registerBtn) registerBtn.addEventListener('click', registerUser);

  // Optional: press Enter in password to login
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') login();
    });
  }
});
