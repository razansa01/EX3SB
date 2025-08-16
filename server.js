/* Authors: Razan Saad 322391103, Mayar Ghanem 213380694 */
/* Main server file - bootstraps Express app and mounts routes */
const express = require('express');
const path = require('path');
const profileRoutes = require('./routes/profile');

const app = express();

/** מרים ראוטים לפני קבצים סטטיים */
app.use('/', profileRoutes);

// Static files (public/)
app.use(express.static(path.join(__dirname, 'public')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
