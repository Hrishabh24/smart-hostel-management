const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');

  // Auto-migration to add 'category' column to 'complaints' table
  db.query("ALTER TABLE complaints ADD COLUMN category VARCHAR(50) DEFAULT 'general'", (alterErr) => {
    if (alterErr) {
      if (alterErr.code === 'ER_DUP_FIELDNAME') {
        console.log("Column 'category' already exists in complaints table. Skipping migration.");
      } else {
        console.error("Error migrating table:", alterErr.message);
      }
    } else {
      console.log("Successfully added 'category' column to complaints table.");
    }
  });
});

module.exports = db;