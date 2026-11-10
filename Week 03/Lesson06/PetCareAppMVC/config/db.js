const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'D@taBas3!ng$',
  database: 'petcare'
});

module.exports = connection;
