const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));
db.serialize(() => {
  db.all("SELECT * FROM doctors;", (err, rows) => console.log("Doctors:", rows));
  db.all("SELECT * FROM users;", (err, rows) => console.log("Users:", rows));
});
db.close();
