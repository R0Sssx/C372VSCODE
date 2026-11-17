const mysql = require('mysql2');

// MySQL connection pool (shared). pool.query() works the same as before for
// existing models; the booking transaction uses pool.getConnection() so all of
// its queries run on one dedicated connection.
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = connection;
