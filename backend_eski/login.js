const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
  const { username, password } = req.body;

  if (username === "Duran" && password === "1903") {
    return res.json({
      success: true,
      message: "Giriş başarılı",
      user: {
        username: "Duran",
        role: "Yönetici"
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: "Kullanıcı adı veya şifre hatalı."
  });
});

module.exports = router;