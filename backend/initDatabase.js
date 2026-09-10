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
    unit TEXT,
    branch TEXT,
    stock INTEGER,
    critical INTEGER,
    lastMovement TEXT
    status TEXT DEFAULT 'AKTIF'
)
  `);
  db.run(
    "ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'AKTIF'",
    (err) => {
      if (err) {
        if (err.message.includes("duplicate column name")) {
          console.log("✅ Ürün status alanı zaten mevcut.");
        } else {
          console.log("❌ Status alanı eklenemedi:", err.message);
        }
      } else {
        console.log("✅ Ürün status alanı eklendi.");
      }
    }
  );
db.run(`
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_branch
ON products(name, branch)
`);
// ŞUBELER TABLOSU

db.run(`
  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'AKTIF',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  INSERT OR IGNORE INTO branches (code, name)
  VALUES
    ('AKS01', 'Aksaray'),
    ('BHL01', 'Bahçelievler'),
    ('ANK01', 'Ankara')
`);
  db.run(`
    INSERT OR IGNORE INTO products
    (id,name,category,unit,branch,stock,critical,lastMovement)
    VALUES
(1,'Ekler','Tatlı','ADET','Aksaray',45,20,''),
(2,'Poğaça','Unlu Mamül','ADET','Bahçelievler',12,20,''),
(3,'Yaş Pasta','Pasta','ADET','Ankara',8,10,'')
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

// İMHA TABLOSU

db.run(`
  CREATE TABLE IF NOT EXISTS waste (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    product_name TEXT,
    branch TEXT,
    amount INTEGER,
    reason TEXT,
    description TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// KULLANICILAR

db.run(`
  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  username TEXT UNIQUE,
  password TEXT,

  fullname TEXT,

  role TEXT,

  branch TEXT,

  status TEXT DEFAULT 'AKTIF',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);
db.run(`
  INSERT OR IGNORE INTO users
(username,password,fullname,role,branch,status)

VALUES

(
'Duran',
process.env.INIT_ADMIN_PASSWORD
'Duran Karakaya',
'YONETICI',
'MERKEZ',
'AKTIF'
);
`);
  console.log("✅ Veritabanı tabloları hazır.");

  db.close();

});