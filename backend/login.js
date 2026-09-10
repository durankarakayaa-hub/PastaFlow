const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = new sqlite3.Database(
  path.join(__dirname, "database", "pastaflow.db")
);

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET tanımlı değil.");
}

// =========================
// LOGIN
// =========================

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Kullanıcı adı ve şifre zorunludur.",
    });
  }

  db.get(
    `
    SELECT *
    FROM users
    WHERE username = ?
    `,
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Kullanıcı adı veya şifre hatalı.",
        });
      }

      // =========================
      // KULLANICI AKTİF Mİ?
      // =========================

      if (user.status !== "AKTIF") {
        return res.status(403).json({
          success: false,
          message: "Bu kullanıcı hesabı pasif durumdadır.",
        });
      }

      // =========================
      // ŞİFRE KONTROLÜ
      // =========================

      let passwordCorrect = false;

      // Eski kullanıcıların şifreleri düz metin olabilir.
      // Yeni sistem bcrypt kullanacak.

      if (
        typeof user.password === "string" &&
        user.password.startsWith("$2")
      ) {
        passwordCorrect = await bcrypt.compare(
          password,
          user.password
        );
      } else {
        // Eski düz metin şifre kontrolü
        passwordCorrect = password === user.password;

        // Doğruysa hemen bcrypt'e çevir
        if (passwordCorrect) {
          const hashedPassword = await bcrypt.hash(password, 10);

          db.run(
            `
            UPDATE users
            SET password = ?
            WHERE id = ?
            `,
            [hashedPassword, user.id],
            (updateErr) => {
              if (updateErr) {
                console.log(
                  "⚠️ Şifre bcrypt'e dönüştürülemedi:",
                  updateErr.message
                );
              } else {
                console.log(
                  "🔐 Kullanıcı şifresi güvenli hale getirildi."
                );
              }
            }
          );
        }
      }

      if (!passwordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Kullanıcı adı veya şifre hatalı.",
        });
      }

      // =========================
      // JWT TOKEN
      // =========================

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          branch: user.branch,
        },
        JWT_SECRET,
        {
          expiresIn: "8h",
        }
      );

      // =========================
      // BAŞARILI LOGIN
      // =========================

      console.log(
        `🔐 Giriş başarılı: ${user.username} | ${user.role} | ${user.branch}`
      );

      res.json({
        success: true,

        token,

        user: {
          id: user.id,
          name: user.fullname,
          username: user.username,
          role: user.role,
          branch: user.branch,
          status: user.status,
        },
      });
    }
  );
});

module.exports = router;