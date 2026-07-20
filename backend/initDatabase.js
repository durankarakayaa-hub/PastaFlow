const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "database", "pastaflow.db")
);

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
  `);


  db.run(`
    INSERT OR IGNORE INTO products
    (id,name,category,branch,stock,critical)
    VALUES
    (1,'Ekler','Tatlı','Aksaray',45,20),
    (2,'Poğaça','Unlu Mamül','Bahçelievler',12,20),
    (3,'Yaş Pasta','Pasta','Ankara',8,10)
  `);



  // STOK HAREKETLERİ TABLOSU

  db.run(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      product_id INTEGER,
      product_name TEXT,
      from_branch TEXT,
      to_branch TEXT,
      amount INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);



  console.log("✅ Veritabanı tabloları hazır.");

  db.close();

});