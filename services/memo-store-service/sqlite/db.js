const sqlite3 = require('sqlite3').verbose();  // Import sqlite3 module

// Create or open the SQLite database file
const db = new sqlite3.Database('./mydairy.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Export the db instance to use it in other files
module.exports = db;