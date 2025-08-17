/**
 * GitHub Repository: https://github.com/razansa01/EX3SB.git
 * Authors: Razan Saad 322391103, Mayar Ganem 213380694
 * Date: 15/08/2025
 * Description: Profile routes for the EX3 app — user registration, login/logout,
 *              session via cookie token, and a per-user tasks API (open/completed).
 *
 * Modules used:
 * - express: Router creation and HTTP handling
 * - cookie-parser: Read/write cookies for session token
 * - fs: Persist users and tasks to data/users.json
 * - path: File-system path resolution
 */

// Profile routes - user registration, login, logout, and tasks API

const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Router-scoped middleware
router.use(express.json());     // Parse JSON request bodies (built-in body parser)
router.use(cookieParser());     // Enable cookie access via req.cookies

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

let usersData = {};

// Load users into memory from data/users.json (on server start)
fs.readFile(USERS_PATH, 'utf8', (err, data) => {
  if (!err && data) {
    try {
      usersData = JSON.parse(data);
    } catch (e) {
      usersData = {};
    }
  }
});

// Persist the in-memory usersData object to users.json
function saveUsersData() {
  fs.writeFile(USERS_PATH, JSON.stringify(usersData, null, 2), (err) => {
    if (err) console.error('Error saving users data:', err);
  });
}

/** Helper: Resolve username by cookie token (returns null if missing/invalid). */
function getUsernameByToken(req) {
  const userToken = req.cookies.userToken;
  if (!userToken) return null;
  return Object.keys(usersData).find(u => usersData[u].token === userToken) || null;
}

/** Guard main.html: redirect unauthenticated users to the login page ("/"). */
router.get('/main.html', (req, res) => {
  const username = getUsernameByToken(req);
  if (!username) {
    return res.redirect('/'); // Not logged in → go to login page
  }
  return res.sendFile(path.join(__dirname, '..', 'public', 'main.html'));
});

/** Login: verify credentials, issue cookie token, and persist it for session continuity. */
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (usersData[username] && usersData[username].password === password) {
    const userToken = `${username}-${Date.now()}`; // Simple unique token (username + timestamp)
    usersData[username].token = userToken;
    saveUsersData(); // Keep token across restarts

    // 15-minute cookie; HttpOnly to reduce XSS risk; SameSite=Lax to guard CSRF a bit
    res.cookie('userToken', userToken, { maxAge: 15 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

/** Logout: clear cookie and invalidate the stored token. */
router.post('/logout', (req, res) => {
  const username = getUsernameByToken(req);
  if (username) {
    usersData[username].token = '';
    saveUsersData();
  }
  res.clearCookie('userToken', { httpOnly: true, sameSite: 'lax' });
  return res.json({ success: true });
});

/** Get user tasks (requires a valid session). */
router.get('/tasks', (req, res) => {
  const username = getUsernameByToken(req);
  if (!username) return res.status(403).json({ error: 'Unauthorized' });
  res.json({
    openTasks: usersData[username].openTasks || [],
    completedTasks: usersData[username].completedTasks || []
  });
});

/** Update user tasks (requires a valid session). Saves immediately to disk. */
router.post('/tasks', (req, res) => {
  const username = getUsernameByToken(req);
  if (!username) return res.status(403).json({ error: 'Unauthorized' });
  usersData[username].openTasks = req.body.openTasks || [];
  usersData[username].completedTasks = req.body.completedTasks || [];
  saveUsersData();
  res.json({ success: true });
});

/** Register: basic username/password creation with empty task lists and no token. */
router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json({ success: false, message: 'Missing fields' });
  if (usersData[username]) {
    return res.json({ success: false, message: 'Username already exists' });
  }
  usersData[username] = { password, openTasks: [], completedTasks: [], token: '' };
  saveUsersData();
  res.json({ success: true });
});

module.exports = router;
