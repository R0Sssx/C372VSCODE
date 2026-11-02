// Admin Controller - dashboard and user management
const User = require('../models/User');
const Pet = require('../models/Pet');
const Journal = require('../models/Journal');

// Dashboard
exports.showDashboard = (req, res) => {
  res.render('adminDashboard', { session: req.session });
};

// View All Users
exports.listUsers = (req, res) => {
  User.getAll((err, results) => {
    if (err) return res.send('Error loading users');

    res.render('adminUsers', {
      users: results,
      session: req.session
    });
  });
};

// View user's profile
exports.showUserDetails = (req, res) => {
  const userId = req.params.id;

  User.getById(userId, (err, userResults) => {
    if (err || userResults.length === 0) return res.send('User not found');

    Pet.getByOwner(userId, (err2, petResults) => {
      if (err2) return res.send('Error retrieving pet info');

      Journal.getByOwner(userId, (err3, journalResults) => {
        if (err3) return res.send('Error retrieving journal entries');

        res.render('adminUserDetails', {
          user: userResults[0],
          pets: petResults,
          journals: journalResults,
          session: req.session
        });
      });
    });
  });
};

// Delete user
exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  User.delete(userId, (err) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.send('Error deleting user');
    }
    res.redirect('/admin/users');
  });
};
