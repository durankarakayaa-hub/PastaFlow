const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "database", "pastaflow.db")
);

bcrypt.hash("123456", 10, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }

  db.serialize(() => {
    db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    branch TEXT,
    stock INTEGER,
    critical INTEGER
  )
`);db.run(`
INSERT OR IGNORE INTO products
(id,name,category,branch,stock,critical)
VALUES
(1,'Ekler','Tatlı','Aksaray',45,20),
(2,'Poğaça','Unlu Mamül','Bahçelievler',12,20),
(3,'Yaş Pasta','Pasta','Ankara',8,10)
`);
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `);

    db.run(
      "INSERT OR IGNORE INTO users (username,password,role) VALUES (?,?,?)",
      ["admin", hash, "admin"],
      function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("✅ Veritabanı hazır.");
        }

        db.close();
      }
    );
  });
});