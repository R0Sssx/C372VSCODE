// Journal Model - all SQL for the journal table
const connection = require('../config/db');

const Journal = {
  // All journal entries belonging to an owner's pets (admin user details)
  getByOwner(ownerId, callback) {
    const sql = `
      SELECT journal.*, pets.id AS pet_id
      FROM journal
      JOIN pets ON journal.pet_id = pets.id
      WHERE pets.owner_id = ?
    `;
    connection.query(sql, [ownerId], callback);
  },

  // Journal entries for one of the owner's pets, with pet details
  getByOwnerAndPet(ownerId, petId, callback) {
    const sql = `
      SELECT journal.*, pets.name, pets.species, pets.breed, pets.age, pets.image
      FROM journal
      JOIN pets ON journal.pet_id = pets.id
      WHERE pets.owner_id = ? AND pets.id = ?
    `;
    connection.query(sql, [ownerId, petId], callback);
  },

  // Search activity/notes, optionally limited to one pet
  search(ownerId, keyword, petId, callback) {
    const searchQuery = `%${keyword}%`;
    let sql = `
      SELECT journal.*, pets.name, pets.species, pets.breed, pets.age, pets.image
      FROM journal
      JOIN pets ON journal.pet_id = pets.id
      WHERE pets.owner_id = ? AND (journal.activity LIKE ? OR journal.notes LIKE ?)`;

    const params = [ownerId, searchQuery, searchQuery];

    if (petId) {
      sql += ' AND pets.id = ?';
      params.push(petId);
    }

    connection.query(sql, params, callback);
  },

  getById(journalId, callback) {
    const sql = 'SELECT * FROM journal WHERE id = ?';
    connection.query(sql, [journalId], callback);
  },

  getPetId(journalId, callback) {
    const sql = 'SELECT pet_id FROM journal WHERE id = ?';
    connection.query(sql, [journalId], callback);
  },

  create(petId, activity, notes, entryDate, callback) {
    const sql = 'INSERT INTO journal (pet_id, activity, notes, entry_date) VALUES (?, ?, ?, ?)';
    connection.query(sql, [petId, activity, notes, entryDate], callback);
  },

  update(journalId, entryDate, activity, notes, petId, callback) {
    const sql = 'UPDATE journal SET entry_date = ?, activity = ?, notes = ?, pet_id = ? WHERE id = ?';
    connection.query(sql, [entryDate, activity, notes, petId, journalId], callback);
  },

  delete(journalId, callback) {
    const sql = 'DELETE FROM journal WHERE id = ?';
    connection.query(sql, [journalId], callback);
  }
};

module.exports = Journal;
