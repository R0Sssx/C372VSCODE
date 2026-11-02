// Pet Care Journal System - entry point
process.loadEnvFile(); // Load DB credentials and session secret from .env

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const PORT = 3000;

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const petRoutes = require('./routes/petRoutes');
const journalRoutes = require('./routes/journalRoutes');

app.use(flash());

// View Engine and Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', petRoutes);
app.use('/', journalRoutes);

// =========================
// Start Server
// =========================
app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
