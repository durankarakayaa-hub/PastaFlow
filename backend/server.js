const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const loginRouter = require("./login");

const app = express();

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


app.use(cors());
app.use(express.json());

app.use("/login", loginRouter);


app.get("/", (req, res) => {
  res.send("PastaFlow Backend Çalışıyor 🚀");
});


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


// ÜRÜN EKLEME
app.post("/products", (req, res) => {

  const {
    name,
    category,
    branch,
    stock,
    critical
  } = req.body;


  db.run(
    `
    INSERT INTO products
    (name, category, branch, stock, critical)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      name,
      category,
      branch,
      stock,
      critical
    ],
    function(err){

      if(err){
        return res.status(500).json(err);
      }


      res.json({
        success:true,
        id:this.lastID
      });

    }
  );

});



// SİLME
app.delete("/products/:id",(req,res)=>{

  const id=req.params.id;


  db.run(
    "DELETE FROM products WHERE id=?",
    [id],
    function(err){

      if(err){
        return res.status(500).json(err);
      }


      res.json({
        success:true
      });

    }
  );

});




// =============================
//// TRANSFER
// BU KISIM :id ROUTE'UNDAN ÖNCE OLACAK
// =============================

app.put("/products/transfer",(req,res)=>{


  const {
    fromProductId,
    toProductId,
    amount
  } = req.body;


  console.log("TRANSFER GELDİ", req.body);



  db.serialize(()=>{


    // Gönderen ürün bilgisi
    db.get(
      "SELECT * FROM products WHERE id=?",
      [fromProductId],
      (err, fromProduct)=>{


        if(err){
          return res.status(500).json(err);
        }


        // Alan ürün bilgisi
        db.get(
          "SELECT * FROM products WHERE id=?",
          [toProductId],
          (err, toProduct)=>{


            if(err){
              return res.status(500).json(err);
            }



            // Gönderen stok düşür
            db.run(
              `
              UPDATE products
              SET stock = stock - ?
              WHERE id = ?
              `,
              [
                amount,
                fromProductId
              ],
              function(err){


                if(err){
                  return res.status(500).json({
                    success:false,
                    error:err.message
                  });
                }



                // Alan stoğunu artır
                db.run(
                  `
                  UPDATE products
                  SET stock = stock + ?
                  WHERE id = ?
                  `,
                  [
                    amount,
                    toProductId
                  ],
                  function(err){


                    if(err){
                      return res.status(500).json({
                        success:false,
                        error:err.message
                      });
                    }



                    // TRANSFER HAREKET KAYDI
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
                        amount
                      ],
                      function(err){


                        if(err){
                          return res.status(500).json(err);
                        }



                        console.log(
                          "🚚 Transfer hareketi kaydedildi:",
                          fromProduct.name,
                          fromProduct.branch,
                          "->",
                          toProduct.branch,
                          amount
                        );



                        res.json({
                          success:true
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


  });


});



// STOK GİRİŞİ
app.put("/products/:id/stock",(req,res)=>{


 const id = req.params.id;
 const { amount } = req.body;


 // Önce ürün bilgisini alıyoruz
 db.get(
  "SELECT * FROM products WHERE id=?",
  [id],
  (err, product)=>{


    if(err){
      return res.status(500).json(err);
    }


    if(!product){
      return res.status(404).json({
        success:false,
        message:"Ürün bulunamadı"
      });
    }



    // Stok artır
    db.run(
      `
      UPDATE products
      SET stock = stock + ?
      WHERE id=?
      `,
      [
        amount,
        id
      ],
      function(err){


        if(err){
          return res.status(500).json(err);
        }



        // Hareket kaydı oluştur
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
            amount
          ],
          function(err){


            if(err){
              return res.status(500).json(err);
            }


            console.log(
              "📥 Stok hareketi kaydedildi:",
              product.name,
              amount
            );


            res.json({
              success:true
            });


          }
        );


      }
    );


  }
 );


});




// STOK ÇIKIŞI
app.put("/products/:id/stock-out",(req,res)=>{


 const id = req.params.id;
 const { amount } = req.body;



 // Önce ürün bilgisi al
 db.get(
  "SELECT * FROM products WHERE id=?",
  [id],
  (err, product)=>{


    if(err){
      return res.status(500).json(err);
    }


    if(!product){
      return res.status(404).json({
        success:false,
        message:"Ürün bulunamadı"
      });
    }



    // Stok düşür
    db.run(
      `
      UPDATE products
      SET stock = stock - ?
      WHERE id=?
      `,
      [
        amount,
        id
      ],
      function(err){


        if(err){
          return res.status(500).json(err);
        }



        // Hareket kaydı oluştur
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
            amount
          ],
          function(err){


            if(err){
              return res.status(500).json(err);
            }


            console.log(
              "📤 Stok çıkış hareketi kaydedildi:",
              product.name,
              amount
            );


            res.json({
              success:true
            });


          }
        );


      }
    );


  }
 );


});



// ÜRÜN DÜZENLEME
// EN SONDA OLMASI ÖNEMLİ
app.put("/products/:id",(req,res)=>{


 const id=req.params.id;


 const {
  name,
  category,
  branch,
  stock,
  critical
 } = req.body;



 db.run(
 `
 UPDATE products
 SET name=?,
 category=?,
 branch=?,
 stock=?,
 critical=?
 WHERE id=?
 `,
 [
  name,
  category,
  branch,
  stock,
  critical,
  id
 ],
 function(err){


  if(err){
    return res.status(500).json(err);
  }


  res.json({
    success:true
  });


 }

 );


});



// STOK HAREKETLERİ
app.get("/movements",(req,res)=>{

  db.all(
    `
    SELECT *
    FROM stock_movements
    ORDER BY id DESC
    `,
    [],
    (err,rows)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(rows);

    }
  );

});

app.listen(3001,()=>{

 console.log(
  "🚀 PastaFlow Backend 3001 portunda çalışıyor."
 );

});