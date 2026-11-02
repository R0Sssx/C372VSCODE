// Pet Model - all SQL for the pets table
const connection = require('../config/db');

const Pet = {
  create(ownerId, name, species, breed, age, image, callback) {
    const sql = 'INSERT INTO pets (owner_id, name, species, breed, age, image) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [ownerId, name, species, breed, age, image], callback);
  },

  getByOwner(ownerId, callback) {
    const sql = 'SELECT * FROM pets WHERE owner_id = ?';
    connection.query(sql, [ownerId], callback);
  }
};

module.exports = Pet;
