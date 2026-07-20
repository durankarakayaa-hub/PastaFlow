const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

const db = new sqlite3.Database(
  path.join(__dirname, "database", "pastaflow.db"),
  (err) => {
    if (err) {
      console.error("Veritabanı açılamadı:", err.message);
    } else {
      console.log("✅ SQLite bağlantısı başarılı.");
    }
  }
);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PastaFlow Backend Çalışıyor 🚀");
});

app.get("/products", (req, res) => {
  console.log("➡️ /products isteği geldi");

  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json(rows);
  });
});

app.listen(3001, () => {
  console.log("✅ Server 3001 portunda çalışıyor.");
});