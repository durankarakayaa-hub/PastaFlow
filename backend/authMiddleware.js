const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET tanımlı değil.");
}

// =========================
// TOKEN KONTROLÜ
// =========================

function authenticateToken(req, res, next) {

  const authHeader =
    req.headers["authorization"];

  const token =
    authHeader &&
    authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Yetkisiz erişim. Token bulunamadı.",
    });
  }

  jwt.verify(
    token,
    JWT_SECRET,
    (err, user) => {

      if (err) {
        return res.status(403).json({
          success: false,
          message: "Geçersiz veya süresi dolmuş token.",
        });
      }

      req.user = user;

      next();
    }
  );
}


// =========================
// SADECE YÖNETİCİ
// =========================

function managerOnly(req, res, next) {

  if (
    !req.user ||
    req.user.role !== "YONETICI"
  ) {

    return res.status(403).json({
      success: false,
      message: "Bu işlem için yönetici yetkisi gereklidir.",
    });

  }

  next();
}


// =========================
// KENDİ ŞUBESİ KONTROLÜ
// =========================

function branchOnly(req, res, next) {

  if (
    !req.user ||
    !req.user.branch
  ) {

    return res.status(403).json({
      success: false,
      message: "Kullanıcının şube bilgisi bulunamadı.",
    });

  }

  next();
}


module.exports = {
  authenticateToken,
  managerOnly,
  branchOnly,
};