import { useEffect, useState } from "react";

function StockIn() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const response = await fetch("http://localhost:3001/products");
    const data = await response.json();
    setProducts(data);
  };

  const addStock = async () => {
  if (!selectedProduct) {
    alert("Lütfen bir ürün seçiniz.");
    return;
  }

  if (!amount || Number(amount) <= 0) {
    alert("Lütfen geçerli bir miktar giriniz.");
    return;
  }

  const response = await fetch(
    `http://localhost:3001/products/${selectedProduct}/stock`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amount),
      }),
    }
  );

  const data = await response.json();

console.log("Stok cevabı:", data);

if (response.ok && data.success) {
    alert("✅ Stok başarıyla güncellendi!");

    setSelectedProduct("");
    setAmount("");

    loadProducts();
  } else {
    alert("❌ Stok güncellenemedi.");
  }
};

  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h1>📥 Stok Girişi</h1>

      <select
        value={selectedProduct}
        onChange={(e) => setSelectedProduct(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      >
        <option value="">Ürün Seçiniz</option>

        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} ({product.branch})
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Eklenecek Miktar"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
        }}
      />

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