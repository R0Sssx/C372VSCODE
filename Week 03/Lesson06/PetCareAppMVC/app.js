const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const PORT = 3000;

app.use(flash());

app.set('view engine', 'ejs');
// Resolve views/public from this file's folder so the app works no matter where `node` is run from
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret123',
  resave: false,
  saveUninitialized: true
}));

app.use(express.json());

app.use('/', require('./routes/homeRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/adminRoutes'));
app.use('/', require('./routes/petRoutes'));
app.use('/', require('./routes/journalRoutes'));
app.use('/', require('./routes/paymentRoutes'));

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
