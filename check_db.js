const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.serialize(() => {
  db.all("SELECT * FROM doctors;", (err, rows) => console.log("Doctors:", rows));
  db.all("SELECT * FROM users;", (err, rows) => console.log("Users:", rows));
});
db.close();
