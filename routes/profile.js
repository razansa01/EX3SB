/* Authors: Razan Saad 322391103, Mayar Ghanem 213380694 */
/* Profile routes - user registration, login, logout, and tasks API */

const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Middlewares for this router only
router.use(express.json()); // Use built-in body parser for JSON
router.use(cookieParser());

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

let usersData = {};

// Load users from data/users.json into memory
fs.readFile(USERS_PATH, 'utf8', (err, data) => {
  if (!err && data) {
    try {
      usersData = JSON.parse(data);
    } catch (e) {
      usersData = {};
    }
  }
});

// Save current usersData object to users.json file
function saveUsersData() {
  fs.writeFile(USERS_PATH, JSON.stringify(usersData, null, 2), (err) => {
    if (err) console.error('Error saving users data:', err);
  });
}

/* === Helper function: get username from cookie token === */
function getUsernameByToken(req) {
  const userToken = req.cookies.userToken;
  if (!userToken) return null;
  return Object.keys(usersData).find(u => usersData[u].token === userToken) || null;
}

/* === Protect main.html: redirect to '/' if not logged in === */
router.get('/main.html', (req, res) => {
  const username = getUsernameByToken(req);
  if (!username) {
    return res.redirect('/'); // Redirect to login page
  }
  return res.sendFile(path.join(__dirname, '..', 'public', 'main.html'));
});

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (usersData[username] && usersData[username].password === password) {
    const userToken = `${username}-${Date.now()}`; // FIX: use template literal for token
    usersData[username].token = userToken;
    saveUsersData(); // NEW: persist token so session survives server restarts
    // 15 minutes expiration, httpOnly for security
    res.cookie('userToken', userToken, { maxAge: 15 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

/* === Logout: clear cookie + reset token === */
router.post('/logout', (req, res) => {
  const username = getUsernameByToken(req);
  if (username) {
    usersData[username].token = '';
    saveUsersData(); // keep file in sync
  }
  res.clearCookie('userToken', { httpOnly: true, sameSite: 'lax' });
  return res.json({ success: true });
});

// Get tasks for the logged-in user
router.get('/tasks', (req, res) => {
  const username = getUsernameByToken(req);
  if (!username) return res.status(403).json({ error: 'Unauthorized' });
  res.json({
    openTasks: usersData[username].openTasks || [],
    completedTasks: usersData[username].completedTasks || []
  });
});

// Update tasks for the logged-in user
router.post('/tasks', (req, res) => {
  const username = getUsernameByToken(req);
  if (!username) return res.status(403).json({ error: 'Unauthorized' });
  usersData[username].openTasks = req.body.openTasks || [];
  usersData[username].completedTasks = req.body.completedTasks || [];
  saveUsersData(); // persist changes immediately
  res.json({ success: true });
});

// Register a new user
router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json({ success: false, message: 'Missing fields' });
  if (usersData[username]) {
    return res.json({ success: false, message: 'Username already exists' });
  }
  usersData[username] = { password, openTasks: [], completedTasks: [], token: '' };
  saveUsersData(); // persist new user
  res.json({ success: true });
});

module.exports = router;
