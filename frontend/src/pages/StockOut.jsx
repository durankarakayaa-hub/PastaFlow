import { useEffect, useState } from "react";

function StockOut() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [amount, setAmount] = useState("");

  // =========================
  // GİRİŞ YAPAN KULLANICI
  // =========================

  const currentUser = JSON.parse(
    localStorage.getItem("pastaflow_user") || "null"
  );

  const isManager =
    currentUser?.role === "YONETICI";

  const userBranch =
    currentUser?.branch || "";

  // =========================
  // ÜRÜNLERİ YÜKLE
  // =========================

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(
        "https://pastaflow.onrender.com/products",
        {
          headers: {
            Authorization:
              "Bearer " +
              localStorage.getItem(
                "pastaflow_token"
              ),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Ürünler alınamadı:",
          data
        );
        return;
      }

      // =========================
      // SADECE AKTİF ÜRÜNLER
      // =========================

      let activeProducts =
        data.filter(
          (product) =>
            product.status === "AKTIF"
        );

      // =========================
      // PERSONEL SADECE KENDİ ŞUBESİ
      // =========================

      if (!isManager) {
        activeProducts =
          activeProducts.filter(
            (product) =>
              product.branch === userBranch
          );
      }

      setProducts(activeProducts);

    } catch (error) {
      console.error(
        "Ürünler yüklenirken hata:",
        error
      );
    }
  };

  // =========================
  // STOK ÇIKIŞI
  // =========================

  const removeStock = async () => {

    if (!selectedProduct) {
      alert(
        "Lütfen bir ürün seçiniz."
      );
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      alert(
        "Lütfen geçerli bir miktar giriniz."
      );
      return;
    }

    // =========================
    // SEÇİLEN ÜRÜNÜ BUL
    // =========================

    const selected =
      products.find(
        (product) =>
          String(product.id) ===
          String(selectedProduct)
      );

    if (!selected) {
      alert(
        "❌ Ürün bulunamadı."
      );
      return;
    }

    // =========================
    // ŞUBE KONTROLÜ
    // =========================

    if (
      !isManager &&
      selected.branch !== userBranch
    ) {
      alert(
        "❌ Bu ürün için stok çıkışı yapma yetkiniz yok."
      );
      return;
    }

    // =========================
    // STOK KONTROLÜ
    // =========================

    if (
      Number(amount) >
      Number(selected.stock)
    ) {
      alert(
        `❌ Yetersiz stok!\nMevcut stok: ${selected.stock}`
      );
      return;
    }

    try {

      const response =
        await fetch(
          `https://pastaflow.onrender.com/products/${selectedProduct}/stock-out`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                "Bearer " +
                localStorage.getItem(
                  "pastaflow_token"
                ),
            },

            body: JSON.stringify({
              amount:
                Number(amount),
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "Stok çıkış cevabı:",
        data
      );

      if (
        response.ok &&
        data.success
      ) {

        alert(
          "✅ Stok çıkışı başarılı!"
        );

        setSelectedProduct("");
        setAmount("");

        loadProducts();

      } else {

        alert(
          "❌ " +
          (
            data.message ||
            "Stok çıkışı yapılamadı."
          )
        );

      }

    } catch (error) {

      console.error(
        "Stok çıkışı hatası:",
        error
      );

      alert(
        "❌ Sunucuya bağlanırken hata oluştu."
      );
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "500px",
      }}
    >

      <h1>
        📤 Stok Çıkışı
      </h1>

      {/* =========================
          KULLANICI / ŞUBE
      ========================= */}

      <div
        style={{
          background: "#f3f4f6",
          border: "1px solid #d1d5db",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        👤{" "}
        {currentUser?.name ||
          "Kullanıcı"}

        {" | "}

        🏪{" "}
        {isManager
          ? "Tüm Şubeler"
          : userBranch}
      </div>

      {/* =========================
          ÜRÜN SEÇ
      ========================= */}

      <select
        value={selectedProduct}
        onChange={(e) =>
          setSelectedProduct(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      >

        <option value="">
          Ürün Seçiniz
        </option>

        {products.map(
          (product) => (
            <option
              key={product.id}
              value={product.id}
            >
              {product.name}{" "}
              ({product.branch}){" "}
              - Stok: {product.stock}
            </option>
          )
        )}

      </select>

      {/* =========================
          MİKTAR
      ========================= */}

      <input
        type="number"
        min="1"
        placeholder="Çıkılacak Miktar"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
        }}
      />

      {/* =========================
          STOKTAN DÜŞ
      ========================= */}

      <button
        onClick={removeStock}
        style={{
          width: "100%",
          padding: "12px",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ➖ Stoktan Düş
      </button>

    </div>
  );
}

export default StockOut;