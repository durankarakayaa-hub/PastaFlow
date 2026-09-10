import { useEffect, useState } from "react";

function StockIn() {
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
        "http://localhost:3001/products",
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
      // AKTİF ÜRÜNLER
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
  // STOK GİRİŞİ
  // =========================

  const addStock = async () => {

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
    // FRONTEND ŞUBE KONTROLÜ
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

    if (
      !isManager &&
      selected.branch !== userBranch
    ) {
      alert(
        "❌ Bu şubedeki ürüne stok girişi yapma yetkiniz yok."
      );
      return;
    }

    try {

      const response =
        await fetch(
          `http://localhost:3001/products/${selectedProduct}/stock`,
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
        "Stok cevabı:",
        data
      );

      if (
        response.ok &&
        data.success
      ) {

        alert(
          "✅ Stok başarıyla güncellendi!"
        );

        setSelectedProduct("");
        setAmount("");

        loadProducts();

      } else {

        alert(
          "❌ " +
          (
            data.message ||
            "Stok güncellenemedi."
          )
        );

      }

    } catch (error) {

      console.error(
        "Stok giriş hatası:",
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
        📥 Stok Girişi
      </h1>

      {/* KULLANICI BİLGİSİ */}

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

      {/* ÜRÜN SEÇ */}

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
              ({product.branch})
            </option>
          )
        )}

      </select>

      {/* MİKTAR */}

      <input
        type="number"
        min="1"
        placeholder="Eklenecek Miktar"
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

      {/* STOK EKLE */}

      <button
        onClick={addStock}
        style={{
          width: "100%",
          padding: "12px",
          background: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ➕ Stoğa Ekle
      </button>

    </div>
  );
}

export default StockIn;