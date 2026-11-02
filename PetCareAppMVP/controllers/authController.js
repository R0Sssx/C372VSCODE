// Auth Controller - sign up, login, logout, index page
const User = require('../models/User');
const Pet = require('../models/Pet');

// Index Page
exports.showIndex = (req, res) => {
  res.render('index', { session: req.session });
};

// Sign Up Page
exports.showSignup = (req, res) => {
  res.render('signup', { session: req.session });
};

// Handle Sign Up Submission
exports.signup = (req, res) => {
  const { username, password, name, role, pet_name, species, breed, age } = req.body;
  let petImage;
  if (req.file) {
    petImage = req.file.filename; // Save only the filename
  } else {
    petImage = null;
  }

  User.create(username, password, name, role, (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      req.flash('error', 'Sign up failed. Please try again.');
      return res.redirect('/signup');
    }

    const userId = result.insertId;
    console.log(userId);
    console.log(petImage);
    Pet.create(userId, pet_name, species, breed, age, petImage, (err2) => {
      if (err2) {
        console.error('Error creating pet:', err2);
        req.flash('error', 'Sign up failed while saving pet. Please try again.');
        return res.redirect('/signup');
      }

      res.redirect('/login');
    });
  });
};

// Login Page
exports.showLogin = (req, res) => {
  res.render('login', { messages: req.flash('success'),
        errors: req.flash('error'), session: req.session });
};

// Handle Login
exports.login = (req, res) => {
  const { username, password } = req.body;
  User.findByCredentials(username, password, (err, results) => {
    if (err) {
      console.error('Login query error:', err);
      req.flash('error', 'Unable to log in. Please check database setup.');
      return res.redirect('/login');
    }

    if (results.length > 0) {
      req.session.user = results[0];
      req.flash('success', 'Login successful!');
      if (results[0].role === 'admin') {
        res.redirect('/admin/dashboard');
      } else {
        res.redirect('/journals');
      }
    } else {
      req.flash('error', 'Invalid username or password.');
      return res.redirect('/login');
    }
  });
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};
