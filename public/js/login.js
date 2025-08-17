/**
 * GitHub Repository: https://github.com/razansa01/EX3SB.git
 * Authors: Razan Saad 322391103, Mayar Ganem 213380694
 * Date: 15/08/2025
 * Description: Client-side script for the login and registration page.
 *              Handles user input, validates fields, sends requests via fetch
 *              to the server, and updates the UI with status messages.
 */

/* --- Login functionality --- */
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

/* --- Registration functionality --- */
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

/* --- Event listeners (no inline handlers in HTML) --- */
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (loginBtn)    loginBtn.addEventListener('click', login);
  if (registerBtn) registerBtn.addEventListener('click', registerUser);

  // Extra: allow pressing Enter in password field to trigger login
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') login();
    });
  }
});
