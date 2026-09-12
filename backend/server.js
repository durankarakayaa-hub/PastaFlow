require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const multer = require("multer");
const XLSX = require("xlsx");
const loginRouter = require("./login");
const {
  authenticateToken,
  managerOnly,
  branchOnly,
} = require("./authMiddleware");
const productsRouter = require("./routes/products");
// ==============================
// ŞUBE ADI STANDARTLAŞTIRMA
// ==============================
function normalizeBranchName(branchName) {
  if (!branchName) return "";

  let name = String(branchName).trim();

  // Türkçe karakter uyumluluğu
  name = name.replace(/I/g, "İ");

  // Küçük harfe çevir
  name = name.toLocaleLowerCase("tr-TR");

  // Her kelimenin ilk harfini büyüt
  name = name
    .split(/\s+/)
    .map((word) => {
      return (
        word.charAt(0).toLocaleUpperCase("tr-TR") +
        word.slice(1)
      );
    })
    .join(" ");

  return name;
}
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
});
let importedProducts = [];
const db = new sqlite3.Database(
  path.join(__dirname, "database", "pastaflow.db"),
  (err) => {
    if (err) {
      console.log("❌ SQLite bağlantı hatası:", err.message);
    } else {
      console.log("✅ SQLite bağlantısı başarılı.");
    }
  }
);
db.configure("busyTimeout", 10000);

db.run("PRAGMA journal_mode = WAL;", (err) => {
  if (err) {
    console.log("❌ SQLite WAL hatası:", err.message);
  } else {
    console.log("✅ SQLite WAL modu aktif.");
  }
});

app.use(cors());
app.use(express.json());

app.use("/login", loginRouter);


app.get("/", (req, res) => {
  res.send("PastaFlow Backend Çalışıyor 🚀");
});

// TODO: products route taşındıktan sonra silinecek
// TÜM ÜRÜNLER
app.get("/products", (req, res) => {

  db.all(
    "SELECT * FROM products",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);

    }
  );

});

app.get("/branches", (req, res) => {

  db.all(
    "SELECT * FROM branches ORDER BY name",
    [],
    (err, rows) => {

      console.log(rows);

      res.json(rows);

    }
  );

});
app.post("/branches", (req, res) => {
  const { code, name } = req.body;

  if (!code || !name) {
    return res.status(400).json({
      success: false,
      message: "Şube kodu ve şube adı zorunludur.",
    });
  }

  db.run(
    "INSERT INTO branches (code, name) VALUES (?, ?)",
    [code, name],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "Şube başarıyla eklendi.",
        id: this.lastID,
      });
    }
  );
});
// ŞUBE GÜNCELLEME
app.put("/branches/:id", (req, res) => {

  const { id } = req.params;
  const { code, name } = req.body;

  if (!code || !name) {
    return res.status(400).json({
      success: false,
      message: "Şube kodu ve şube adı zorunludur.",
    });
  }

  db.run(
    `
    UPDATE branches
    SET code = ?, name = ?
    WHERE id = ?
    `,
    [code, name, id],
    function (err) {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "✅ Şube başarıyla güncellendi.",
      });

    }
  );

});


// ŞUBE AKTİF / PASİF
app.put("/branches/:id/status", (req, res) => {

  const { id } = req.params;

  db.get(
    "SELECT status FROM branches WHERE id = ?",
    [id],
    (err, branch) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Şube bulunamadı.",
        });
      }

      const newStatus =
        branch.status === "PASIF"
          ? "AKTIF"
          : "PASIF";

      db.run(
        `
        UPDATE branches
        SET status = ?
        WHERE id = ?
        `,
        [newStatus, id],
        function (err) {

          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          res.json({
            success: true,
            message:
              newStatus === "PASIF"
                ? "🔴 Şube pasife alındı."
                : "🟢 Şube aktifleştirildi.",
          });

        }
      );

    }
  );

});
// =============================
// KULLANICILAR
// =============================

app.get("/users", (req, res) => {

  db.all(
    "SELECT * FROM users ORDER BY fullname",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);

    }
  );

});


// =============================
// KULLANICI EKLEME
// =============================

app.post("/users", (req, res) => {

  const {
    username,
    password,
    fullname,
    role,
    branch,
  } = req.body;

  db.run(
    `
    INSERT INTO users
    (username, password, fullname, role, branch, status)
    VALUES (?, ?, ?, ?, ?, 'AKTIF')
    `,
    [
      username,
      password,
      fullname,
      role,
      branch,
    ],
    function (err) {

      if (err) {
        return res.json({
          success: false,
          message: "Kullanıcı eklenemedi.",
        });
      }

      res.json({
        success: true,
        message: "✅ Kullanıcı başarıyla eklendi.",
      });

    }
  );

});


// =============================
// KULLANICI GÜNCELLEME
// =============================

app.put("/users/:id", (req, res) => {

  const { id } = req.params;

  const {
    username,
    password,
    fullname,
    role,
    branch,
  } = req.body;

  db.run(
    `
    UPDATE users
    SET
      username = ?,
      password = ?,
      fullname = ?,
      role = ?,
      branch = ?
    WHERE id = ?
    `,
    [
      username,
      password,
      fullname,
      role,
      branch,
      id,
    ],
    function (err) {

      if (err) {
        return res.json({
          success: false,
          message: "Kullanıcı güncellenemedi.",
        });
      }

      res.json({
        success: true,
        message: "✅ Kullanıcı başarıyla güncellendi.",
      });

    }
  );

});


// =============================
// KULLANICI AKTİF / PASİF
// =============================

app.put("/users/:id/status", (req, res) => {

  const { id } = req.params;

  db.get(
    "SELECT status FROM users WHERE id = ?",
    [id],
    (err, user) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Kullanıcı bulunamadı.",
        });
      }

      const newStatus =
        user.status === "PASIF"
          ? "AKTIF"
          : "PASIF";

      db.run(
        `
        UPDATE users
        SET status = ?
        WHERE id = ?
        `,
        [newStatus, id],
        function (err) {

          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            });
          }

          res.json({
            success: true,
            message:
              newStatus === "PASIF"
                ? "🔴 Kullanıcı pasife alındı."
                : "🟢 Kullanıcı aktifleştirildi.",
          });

        }
      );

    }
  );

});
app.post("/logo-import", upload.single("file"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Lütfen bir Excel dosyası seçin.",
    });
  }

  console.log("📂 Dosya:", req.file.originalname);
  console.log("📦 Boyut:", req.file.size);
  console.log("📄 Tür:", req.file.mimetype);

  // =====================================
  // ÖNCE SİSTEMDEKİ ŞUBELERİ AL
  // =====================================

  db.all(
    `
    SELECT name
    FROM branches
    WHERE status = 'AKTIF'
    `,
    [],
    (branchErr, branches) => {

      if (branchErr) {
        console.error(
          "❌ Şubeler alınamadı:",
          branchErr.message
        );

        return res.status(500).json({
          success: false,
          message: "Şube listesi alınamadı.",
        });
      }

      // =====================================
      // ŞUBE İSMİNİ KARŞILAŞTIRMA İÇİN
      // STANDART HALE GETİR
      // =====================================

      const normalizeKey = (value) => {

        return String(value || "")
          .trim()
          .toLocaleUpperCase("tr-TR");

      };

      // =====================================
      // SİSTEMDEKİ ŞUBELERİ EŞLEŞTİR
      // =====================================

      const branchMap = {};

      branches.forEach((branch) => {

        branchMap[
          normalizeKey(branch.name)
        ] = branch.name;

      });

      console.log(
        "🏢 Sistemdeki şubeler:",
        branchMap
      );

      // =====================================
      // EXCEL OKUMA
      // =====================================

      const workbook = XLSX.read(
        req.file.buffer,
        {
          type: "buffer",
        }
      );

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const rows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            header: 1,
          }
        );

      console.log(
        "📊 Excel ilk satırlar:",
        rows.slice(0, 8)
      );

      // =====================================
      // ÜRÜNLERİ HAZIRLA
      // =====================================

      const products =
        rows
          .slice(2)
          .filter((row) => row[0])
          .map((row) => {

            const excelBranch =
              String(row[2] || "").trim();

            const normalizedKey =
              normalizeKey(excelBranch);

            // LOGO'daki şubeyi
            // sistemdeki resmi şube adına çevir
            const systemBranch =
              branchMap[normalizedKey];

            let lastMovement =
              row[4];

            // LOGO Excel tarihi
            // seri numarası olarak geliyorsa
            if (
              typeof lastMovement === "number" &&
              lastMovement > 30000
            ) {

              const excelDate =
                new Date(
                  Date.UTC(
                    1899,
                    11,
                    30
                  ) +
                  lastMovement *
                    24 *
                    60 *
                    60 *
                    1000
                );

              lastMovement =
                excelDate
                  .toISOString()
                  .slice(0, 10);

            }

            return {

              name:
                String(
                  row[0] || ""
                ).trim(),

              unit:
                String(
                  row[1] || ""
                ).trim(),

              // Sistem şubesinde varsa
              // resmi adı kullan
              branch:
                systemBranch ||
                excelBranch,

              stock:
                Number(row[3]) || 0,

              lastMovement:
                lastMovement || "",

              // Eşleşme kontrolü için
              branchMatched:
                !!systemBranch,

            };

          });

      // =====================================
      // BELLEĞE KAYDET
      // =====================================

      importedProducts =
        products;

      // =====================================
      // EŞLEŞMEYEN ŞUBELERİ BUL
      // =====================================

      const unmatchedBranches =
        [
          ...new Set(
            products
              .filter(
                (product) =>
                  !product.branchMatched
              )
              .map(
                (product) =>
                  product.branch
              )
          )
        ];

      console.log(
        "📦 Bellekte tutulan ürün:",
        importedProducts.length
      );

      console.log(
        "⚠️ Eşleşmeyen şubeler:",
        unmatchedBranches
      );

      // =====================================
      // CEVAP
      // =====================================

      res.json({

        success: true,

        message:
          `${products.length} ürün başarıyla okundu.`,

        products:
          products.slice(0, 50),

        unmatchedBranches,

      });

    }
  );

});
app.post("/logo-import-confirm", (req, res) => {
  console.log("✅ İçe aktarma onaylandı.");
  console.log("Aktarılacak ürün sayısı:", importedProducts.length);

  res.json({
    success: true,
    message: `${importedProducts.length} ürün aktarıma hazır.`,
  });
});
app.post("/logo-import-save", (req, res) => {

  console.log("💾 SQLite kayıt işlemi başladı.");

  if (!importedProducts || importedProducts.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Aktarılacak ürün bulunamadı.",
    });
  }

  // Sistemde kayıtlı şubeleri getir
  db.all(
    "SELECT name FROM branches",
    [],
    (err, branches) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      // Şube isimlerini eşleştirme tablosuna dönüştür
      const branchMap = {};

      branches.forEach((branch) => {

        const key = String(branch.name)
          .trim()
          .toLocaleUpperCase("tr-TR");

        branchMap[key] = branch.name;

      });

      let completed = 0;
      let errorCount = 0;

      for (const product of importedProducts) {

        const excelBranch = String(product.branch || "")
          .trim()
          .toLocaleUpperCase("tr-TR");

        // Excel'deki şube adını sistemdeki gerçek şube adına dönüştür
        const normalizedBranch =
          branchMap[excelBranch] ||
          String(product.branch || "").trim();

        db.run(
          `
          INSERT INTO products
          (
            name,
            category,
            unit,
            branch,
            stock,
            critical,
            lastMovement
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)

          ON CONFLICT(name, branch)
          DO UPDATE SET
            category = excluded.category,
            unit = excluded.unit,
            stock = excluded.stock,
            critical = excluded.critical,
            lastMovement = excluded.lastMovement
          `,
          [
            product.name,
            product.unit,
            product.unit,
            normalizedBranch,
            product.stock,
            0,
            product.lastMovement || "",
          ],
          (err) => {

            if (err) {
              console.log(
                "❌ Kayıt hatası:",
                product.name,
                err.message
              );

              errorCount++;

            } else {

              console.log(
                "✅ Kaydedildi:",
                product.name,
                "| Şube:",
                normalizedBranch
              );

            }

            completed++;

            if (completed === importedProducts.length) {

              res.json({
                success: true,
                message:
                  `${completed} ürün işlendi. ` +
                  `${errorCount} hata oluştu.`,
              });

            }

          }
        );

      }

    }
  );

});
// =============================
// ÜRÜN EKLEME
// =============================

app.post(
  "/products",
  authenticateToken,
  (req, res) => {

    const {
      name,
      category,
      unit,
      branch,
      stock,
      critical
    } = req.body;

    // =============================
    // ZORUNLU ALAN KONTROLÜ
    // =============================

    if (
      !name ||
      !category ||
      !unit ||
      !branch
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Ürün adı, kategori, birim ve şube zorunludur."
      });
    }

    // =============================
    // ÜRÜNÜ EKLE
    // =============================

    db.run(
      `
      INSERT INTO products
      (
        name,
        category,
        unit,
        branch,
        stock,
        critical,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'AKTIF')
      `,
      [
        name,
        category,
        unit,
        branch,
        Number(stock) || 0,
        Number(critical) || 0
      ],
      function(err) {

        if (err) {

          console.error(
            "❌ Ürün ekleme hatası:",
            err
          );

          return res.status(500).json({
            success: false,
            message: err.message
          });

        }

        console.log(
          "✅ Yeni ürün eklendi:",
          name,
          "| Birim:",
          unit,
          "| Şube:",
          branch
        );

        res.json({
          success: true,
          id: this.lastID,
          message:
            "Ürün başarıyla eklendi."
        });

      }
    );

  }
);

// SİLME - SADECE YÖNETİCİ
app.delete(
  "/products/:id",
  authenticateToken,
  managerOnly,
  (req, res) => {

    const id = req.params.id;

    db.run(
      "DELETE FROM products WHERE id=?",
      [id],
      function(err) {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          success: true
        });

      }
    );

  }
);



app.use((req, res, next) => {
  console.log("📡 İSTEK GELDİ:", req.method, req.url);
  next();
});
// =============================
// 🚚 TRANSFER
// =============================

app.put("/products/transfer", (req, res) => {

  console.log("🚚 TRANSFER İSTEĞİ GELDİ");
  console.log("BODY:", req.body);

  const {
    fromProductId,
    toProductId,
    toBranch,
    amount
  } = req.body;

  // =============================
  // TEMEL KONTROLLER
  // =============================

  if (!fromProductId || !toBranch || !amount) {
    return res.status(400).json({
      success: false,
      message: "Transfer bilgileri eksik."
    });
  }

  const transferAmount = Number(amount);

  if (transferAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Transfer miktarı 0'dan büyük olmalıdır."
    });
  }

  db.get(
    "SELECT * FROM products WHERE id = ?",
    [fromProductId],
    (err, fromProduct) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (!fromProduct) {
        return res.status(404).json({
          success: false,
          message: "Gönderen ürün bulunamadı."
        });
      }

      // =============================
      // STOK KONTROLÜ
      // =============================

      if (Number(fromProduct.stock) < transferAmount) {

        return res.status(400).json({
          success: false,
          message: `Yetersiz stok. Mevcut stok: ${fromProduct.stock}`
        });

      }

      // =============================
      // AYNI ŞUBE KONTROLÜ
      // =============================

      if (fromProduct.branch === toBranch) {

        return res.status(400).json({
          success: false,
          message: "Gönderen ve hedef şube aynı olamaz."
        });

      }

      // =============================
      // HEDEF ÜRÜNÜ BUL
      // =============================

     const findTargetProduct = () => {

  // Öncelik: hedef şubede gönderen ürünün adını ara
  db.get(
    `
    SELECT *
    FROM products
    WHERE name = ?
      AND branch = ?
      AND status = 'AKTIF'
    `,
    [
      fromProduct.name,
      toBranch
    ],
    (err, toProduct) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      // Hedef şubede aynı ürün varsa
      if (toProduct) {

        console.log(
          "🎯 Hedef ürün bulundu:",
          toProduct.name,
          "|",
          toProduct.branch
        );

        processTransfer(toProduct);

      } else {

        // Hedef şubede ürün yok
        console.log(
          "🆕 Hedef şubede ürün bulunamadı:",
          fromProduct.name,
          "|",
          toBranch
        );

        processTransfer(null);

      }

    }
  );

};

      // =============================
      // TRANSFER İŞLEMİ
      // =============================

      const processTransfer = (toProduct) => {

        // Hedef ürün varsa
        if (toProduct) {

          // FARKLI ÜRÜN KONTROLÜ
          if (
            toProduct.name.trim().toLowerCase() !==
            fromProduct.name.trim().toLowerCase()
          ) {

            return res.status(400).json({
              success: false,
              message:
                "Farklı ürünler arasında transfer yapılamaz."
            });

          }

          db.serialize(() => {

            // =============================
            // GÖNDEREN STOĞU DÜŞ
            // =============================

            db.run(
              `
              UPDATE products
              SET stock = stock - ?
              WHERE id = ?
              `,
              [
                transferAmount,
                fromProduct.id
              ],
              function (err) {

                if (err) {
                  return res.status(500).json({
                    success: false,
                    message: err.message
                  });
                }

                // =============================
                // HEDEF STOĞU ARTIR
                // =============================

                db.run(
                  `
                  UPDATE products
                  SET stock = stock + ?
                  WHERE id = ?
                  `,
                  [
                    transferAmount,
                    toProduct.id
                  ],
                  function (err) {

                    if (err) {
                      return res.status(500).json({
                        success: false,
                        message: err.message
                      });
                    }

                    // =============================
                    // HAREKET KAYDI
                    // =============================

                    db.run(
                      `
                      INSERT INTO stock_movements
                      (
                        type,
                        product_id,
                        product_name,
                        from_branch,
                        to_branch,
                        amount
                      )
                      VALUES (?, ?, ?, ?, ?, ?)
                      `,
                      [
                        "TRANSFER",
                        fromProduct.id,
                        fromProduct.name,
                        fromProduct.branch,
                        toProduct.branch,
                        transferAmount
                      ],
                      function (err) {

                        if (err) {
                          return res.status(500).json({
                            success: false,
                            message: err.message
                          });
                        }

                        console.log(
                          "🚚 Transfer tamamlandı:",
                          fromProduct.name,
                          fromProduct.branch,
                          "->",
                          toProduct.branch,
                          transferAmount
                        );

                        return res.json({
                          success: true,
                          message:
                            `${transferAmount} adet ${fromProduct.name} transfer edildi.`
                        });

                      }
                    );

                  }
                );

              }
            );

          });

        } else {

          // =============================
          // HEDEFTE ÜRÜN YOK
          // YENİ ÜRÜN OLUŞTUR
          // =============================

          db.serialize(() => {

            // Gönderen stok düş
            db.run(
              `
              UPDATE products
              SET stock = stock - ?
              WHERE id = ?
              `,
              [
                transferAmount,
                fromProduct.id
              ],
              function (err) {

                if (err) {
                  return res.status(500).json({
                    success: false,
                    message: err.message
                  });
                }

                // Yeni ürün oluştur
                db.run(
                  `
                  INSERT INTO products
                  (
                    name,
                    category,
                    unit,
                    branch,
                    stock,
                    critical,
                    status
                  )
                  VALUES (?, ?, ?, ?, ?, ?, 'AKTIF')
                  `,
                  [
                    fromProduct.name,
                    fromProduct.category,
                    fromProduct.unit,
                    toBranch,
                    transferAmount,
                    fromProduct.critical
                  ],
                  function (err) {

                    if (err) {
                      return res.status(500).json({
                        success: false,
                        message: err.message
                      });
                    }

                    const newProductId = this.lastID;

                    // Hareket kaydı
                    db.run(
                      `
                      INSERT INTO stock_movements
                      (
                        type,
                        product_id,
                        product_name,
                        from_branch,
                        to_branch,
                        amount
                      )
                      VALUES (?, ?, ?, ?, ?, ?)
                      `,
                      [
                        "TRANSFER",
                        fromProduct.id,
                        fromProduct.name,
                        fromProduct.branch,
                        toBranch,
                        transferAmount
                      ],
                      function (err) {

                        if (err) {
                          return res.status(500).json({
                            success: false,
                            message: err.message
                          });
                        }

                        console.log(
                          "🆕 Hedef şubede yeni ürün oluşturuldu:",
                          fromProduct.name,
                          toBranch,
                          transferAmount
                        );

                        return res.json({
                          success: true,
                          newProduct: true,
                          productId: newProductId,
                          message:
                            `${transferAmount} adet ${fromProduct.name} transfer edildi ve ${toBranch} şubesinde yeni ürün oluşturuldu.`
                        });

                      }
                    );

                  }
                );

              }
            );

          });

        }

      };

      findTargetProduct();

    }
  );

});


// STOK GİRİŞİ
app.put(
  "/products/:id/stock",
  authenticateToken,
  (req, res) => {

    const id = req.params.id;
    const { amount } = req.body;

    // =========================
    // MİKTAR KONTROLÜ
    // =========================

    if (
      amount === undefined ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Geçerli bir stok miktarı girilmelidir.",
      });
    }

    // =========================
    // ÜRÜNÜ BUL
    // =========================

    db.get(
      "SELECT * FROM products WHERE id=?",
      [id],
      (err, product) => {

        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Ürün bulunamadı.",
          });
        }

        // =========================
        // ŞUBE YETKİSİ
        // YÖNETİCİ HER ŞUBE
        // PERSONEL SADECE KENDİ ŞUBESİ
        // =========================

        if (
          req.user.role !== "YONETICI" &&
          product.branch !== req.user.branch
        ) {
          return res.status(403).json({
            success: false,
            message:
              "Bu ürün için stok girişi yapma yetkiniz yok.",
          });
        }

        // =========================
        // STOK ARTIR
        // =========================

        db.run(
          `
          UPDATE products
          SET stock = stock + ?
          WHERE id=?
          `,
          [
            Number(amount),
            id,
          ],
          function (err) {

            if (err) {
              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            // =========================
            // HAREKET KAYDI
            // =========================

            db.run(
              `
              INSERT INTO stock_movements
              (
                type,
                product_id,
                product_name,
                from_branch,
                to_branch,
                amount
              )
              VALUES (?, ?, ?, ?, ?, ?)
              `,
              [
                "STOK GİRİŞİ",
                product.id,
                product.name,
                "",
                product.branch,
                Number(amount),
              ],
              function (err) {

                if (err) {
                  return res.status(500).json({
                    success: false,
                    message:
                      err.message,
                  });
                }

                console.log(
                  "📥 Stok hareketi kaydedildi:",
                  product.name,
                  product.branch,
                  Number(amount)
                );

                res.json({
                  success: true,
                  message:
                    "Stok başarıyla güncellendi.",
                });

              }
            );

          }
        );

      }
    );

  }
);



// =============================
// STOK ÇIKIŞI
// =============================

app.put(
  "/products/:id/stock-out",
  authenticateToken,
  (req, res) => {

    const id = req.params.id;
    const { amount } = req.body;

    // =========================
    // MİKTAR KONTROLÜ
    // =========================

    if (
      amount === undefined ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Geçerli bir stok miktarı girilmelidir.",
      });
    }

    // =========================
    // ÜRÜNÜ BUL
    // =========================

    db.get(
      "SELECT * FROM products WHERE id=?",
      [id],
      (err, product) => {

        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Ürün bulunamadı.",
          });
        }

        // =========================
        // ŞUBE YETKİSİ
        // =========================

        if (
          req.user.role !== "YONETICI" &&
          product.branch !== req.user.branch
        ) {
          return res.status(403).json({
            success: false,
            message:
              "Bu ürün için stok çıkışı yapma yetkiniz yok.",
          });
        }

        // =========================
        // STOK KONTROLÜ
        // =========================

        if (
          Number(amount) >
          Number(product.stock)
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Yetersiz stok! Mevcut stok: ${product.stock}`,
          });
        }

        // =========================
        // STOK DÜŞÜR
        // =========================

        db.run(
          `
          UPDATE products
          SET stock = stock - ?
          WHERE id=?
          `,
          [
            Number(amount),
            id,
          ],
          function (err) {

            if (err) {
              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            // =========================
            // HAREKET KAYDI
            // =========================

            db.run(
              `
              INSERT INTO stock_movements
              (
                type,
                product_id,
                product_name,
                from_branch,
                to_branch,
                amount
              )
              VALUES (?, ?, ?, ?, ?, ?)
              `,
              [
                "STOK ÇIKIŞI",
                product.id,
                product.name,
                product.branch,
                "",
                Number(amount),
              ],
              function (err) {

                if (err) {
                  return res.status(500).json({
                    success: false,
                    message:
                      err.message,
                  });
                }

                console.log(
                  "📤 Stok çıkışı kaydedildi:",
                  product.name,
                  product.branch,
                  Number(amount)
                );

                res.json({
                  success: true,
                  message:
                    "Stok çıkışı başarıyla tamamlandı.",
                });

              }
            );

          }
        );

      }
    );

  }
);



// ÜRÜN DÜZENLEME
// EN SONDA OLMASI ÖNEMLİ
app.put(
  "/products/:id",
  authenticateToken,
  managerOnly,
  (req, res) => {

    const id = req.params.id;

    const {
      name,
      category,
      unit,
      branch,
      stock,
      critical
    } = req.body;

    db.run(
      `
      UPDATE products
      SET
        name=?,
        category=?,
        unit=?,
        branch=?,
        stock=?,
        critical=?
      WHERE id=?
      `,
      [
        name,
        category,
        unit,
        branch,
        stock,
        critical,
        id
      ],
      function(err) {

        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "Ürün bulunamadı."
          });
        }

        res.json({
          success: true,
          message: "Ürün başarıyla güncellendi."
        });

      }
    );

  }
);
// ÜRÜN AKTİF / PASİF DURUMU
app.put(
  "/products/:id/status",
  authenticateToken,
  managerOnly,
  (req, res) => {

  const id = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Durum bilgisi gerekli."
    });
  }

  if (status !== "AKTIF" && status !== "PASIF") {
    return res.status(400).json({
      success: false,
      message: "Geçersiz durum."
    });
  }

  db.run(
    `
    UPDATE products
    SET status = ?
    WHERE id = ?
    `,
    [status, id],
    function (err) {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Ürün bulunamadı."
        });
      }

      res.json({
        success: true,
        message:
          status === "PASIF"
            ? "🔴 Ürün pasife alındı."
            : "🟢 Ürün aktifleştirildi."
      });

    }
  );

});
// =============================
// İMHA KAYDI OLUŞTUR
// =============================

app.post(
  "/waste",
  authenticateToken,
  (req, res) => {

    // Frontend'den gelen bilgiler
    const {
      product_id,
      amount,
      reason,
      description,
      created_by
    } = req.body;

    // =========================
    // MİKTAR KONTROLÜ
    // =========================

    if (
      product_id === undefined ||
      amount === undefined ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Geçerli bir ürün ve imha miktarı girilmelidir."
      });
    }

    // =========================
    // SEBEP KONTROLÜ
    // =========================

    if (
      !reason ||
      !String(reason).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "İmha sebebi zorunludur."
      });
    }

    // =========================
    // ÜRÜNÜ BUL
    // =========================

    db.get(
      "SELECT * FROM products WHERE id = ?",
      [Number(product_id)],
      (err, product) => {

        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        if (!product) {
          return res.status(404).json({
            success: false,
            message:
              "Ürün bulunamadı."
          });
        }

        // =========================
        // PERSONEL ŞUBE KONTROLÜ
        // =========================

        if (
          req.user.role !== "YONETICI" &&
          product.branch !== req.user.branch
        ) {

          console.log(
            "🚫 İmha yetkisi reddedildi:",
            req.user.username,
            req.user.branch,
            "->",
            product.branch
          );

          return res.status(403).json({
            success: false,
            message:
              "Bu ürün için imha yapma yetkiniz yok."
          });

        }

        // =========================
        // STOK KONTROLÜ
        // =========================

        if (
          Number(amount) >
          Number(product.stock)
        ) {

          return res.status(400).json({
            success: false,
            message:
              `Yetersiz stok! Mevcut stok: ${product.stock}`
          });

        }

        // =========================
        // STOKTAN DÜŞ
        // =========================

        db.run(
          `
          UPDATE products
          SET stock = stock - ?
          WHERE id = ?
          `,
          [
            Number(amount),
            Number(product_id)
          ],
          function (err) {

            if (err) {
              return res.status(500).json({
                success: false,
                message: err.message
              });
            }

            // =========================
            // İMHA KAYDI
            // =========================

            db.run(
              `
              INSERT INTO waste
              (
                product_id,
                product_name,
                branch,
                amount,
                reason,
                description,
                created_by
              )
              VALUES (?, ?, ?, ?, ?, ?, ?)
              `,
              [
                product.id,
                product.name,
                product.branch,
                Number(amount),
                String(reason).trim(),
                description
                  ? String(description).trim()
                  : "",
                created_by ||
                  req.user.username
              ],
              function (err) {

                if (err) {
                  return res.status(500).json({
                    success: false,
                    message: err.message
                  });
                }

                // =========================
                // STOK HAREKETİ
                // =========================

                db.run(
                  `
                  INSERT INTO stock_movements
                  (
                    type,
                    product_id,
                    product_name,
                    from_branch,
                    to_branch,
                    amount
                  )
                  VALUES (?, ?, ?, ?, ?, ?)
                  `,
                  [
                    "İMHA",
                    product.id,
                    product.name,
                    product.branch,
                    null,
                    Number(amount)
                  ],
                  function (err) {

                    if (err) {
                      return res.status(500).json({
                        success: false,
                        message:
                          err.message
                      });
                    }

                    console.log(
                      "🗑️ İmha kaydedildi:",
                      product.name,
                      "|",
                      product.branch,
                      "|",
                      Number(amount)
                    );

                    res.json({
                      success: true,
                      message:
                        "✅ İmha işlemi başarıyla tamamlandı."
                    });

                  }
                );

              }
            );

          }
        );

      }
    );

  }
);
  


app.get("/dashboard", (req, res) => {
  const dashboard = {};

  db.get(
    "SELECT COUNT(*) AS totalProducts FROM products",
    [],
    (err, row) => {
      if (err) return res.status(500).json(err);

      dashboard.totalProducts = row.totalProducts;

      db.get(
        "SELECT COUNT(*) AS totalBranches FROM branches",
        [],
        (err, row) => {
          if (err) return res.status(500).json(err);

          dashboard.totalBranches = row.totalBranches;

          db.get(
            "SELECT COUNT(*) AS totalWaste FROM waste",
            [],
            (err, row) => {
              if (err) return res.status(500).json(err);

              dashboard.totalWaste = row.totalWaste;

              db.get(
                "SELECT COUNT(*) AS criticalStock FROM products WHERE stock <= critical",
                [],
                (err, row) => {
                  if (err) return res.status(500).json(err);

                  dashboard.criticalStock = row.criticalStock;

                  res.json(dashboard);
                }
              );
            }
          );
        }
      );
    }
  );
});
// =========================
// STOK HAREKETLERİ
// =========================

app.get(
  "/stock-movements",
  authenticateToken,
  (req, res) => {

    const user = req.user;

    let sql = `
      SELECT *
      FROM stock_movements
    `;

    let params = [];

    // YÖNETİCİ → TÜM HAREKETLER
    if (user.role === "YONETICI") {

      sql += `
        ORDER BY id DESC
      `;

    } else {

      // PERSONEL → SADECE KENDİ ŞUBESİ
      sql += `
        WHERE from_branch = ?
           OR to_branch = ?
        ORDER BY id DESC
      `;

      params = [
        user.branch,
        user.branch
      ];

    }

    db.all(
      sql,
      params,
      (err, rows) => {

        if (err) {

          console.error(
            "❌ Hareketler alınamadı:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: err.message
          });

        }

        res.json({
          success: true,
          movements: rows
        });

      }
    );

  }
);
// =========================
// AKTİF KULLANICI BİLGİSİ
// =========================

app.get("/me", authenticateToken, (req, res) => {

  console.log("👤 ME KULLANICISI:", req.user);

  res.json({
    success: true,
    user: req.user,
  });

});
// =========================
// ESKİ ŞUBE İSİMLERİNİ DÜZELT
// =========================

app.get("/fix-branch-names", (req, res) => {

  const branchMap = [
    {
      oldName: "BAHÇELİEVLER",
      newName: "Bahçelievler",
    },
    {
      oldName: "AKSARAY",
      newName: "Aksaray",
    },
    {
      oldName: "ANKARA",
      newName: "Ankara",
    },
  ];

  let completed = 0;

  branchMap.forEach((item) => {

    db.run(
      `
      UPDATE products
      SET branch = ?
      WHERE TRIM(branch) = ?
      `,
      [
        item.newName,
        item.oldName,
      ],
      function (err) {

        if (err) {
          console.error(
            "Şube düzeltme hatası:",
            err.message
          );
        } else {
          console.log(
            `✅ ${item.oldName} → ${item.newName}: ${this.changes} ürün düzeltildi.`
          );
        }

        completed++;

        if (
          completed ===
          branchMap.length
        ) {
          res.json({
            success: true,
            message:
              "Şube isimleri düzeltildi.",
          });
        }

      }
    );

  });

});
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 PastaFlow Backend ${PORT} portunda çalışıyor.`
  );
});