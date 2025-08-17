/**
 * GitHub Repository: https://github.com/razansa01/EX3SB.git
 * Authors: Razan Saad 322391103, Mayar Ganem 213380694
 * Date: 17/08/2025
 * Description: Entry point for the EX3 app. Spins up an Express server,
 *              wires core middleware, mounts auth/profile routes, and serves static files.
 *
 * Modules used:
 * - express: HTTP server & routing
 * - path:    Filesystem path utilities
 */

const express = require('express');
const path = require('path');
const profileRoutes = require('./routes/profile');

const app = express();

// Mount application routes before exposing static assets
app.use('/', profileRoutes);

// Serve static assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// Boot the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EX3 server listening on http://localhost:${PORT}`);
});
