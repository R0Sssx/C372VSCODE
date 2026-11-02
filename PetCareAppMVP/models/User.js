// User Model - all SQL for the users table
const connection = require('../config/db');
const crypto = require('crypto');

function sha256Hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

const User = {
  // Insert a new user (password is hashed before saving)
  create(username, password, name, role, callback) {
    const hashedPassword = sha256Hash(password);
    const sql = 'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)';
    connection.query(sql, [username, hashedPassword, name, role], callback);
  },

  // Find user matching username + password (used for login)
  findByCredentials(username, password, callback) {
    const hashedPassword = sha256Hash(password);
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    connection.query(sql, [username, hashedPassword], callback);
  },

  getAll(callback) {
    const sql = 'SELECT id, name, username, role FROM users';
    connection.query(sql, callback);
  },

  getById(userId, callback) {
    const sql = 'SELECT id, name, username, role FROM users WHERE id = ?';
    connection.query(sql, [userId], callback);
  },

  delete(userId, callback) {
    const sql = 'DELETE FROM users WHERE id = ?';
    connection.query(sql, [userId], callback);
  }
};

module.exports = User;
