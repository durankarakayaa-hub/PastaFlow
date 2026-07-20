import { useEffect, useState } from "react";

function StockOut() {
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

  const removeStock = async () => {
    if (!selectedProduct) {
      alert("Lütfen bir ürün seçiniz.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Lütfen geçerli bir miktar giriniz.");
      return;
    }

    const response = await fetch(
      `http://localhost:3001/products/${selectedProduct}/stock-out`,
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

    if (data.success) {
      alert("✅ Stok çıkışı başarılı!");

      setSelectedProduct("");
      setAmount("");

      loadProducts();
    } else {
      alert("❌ Stok çıkışı yapılamadı.");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h1>📤 Stok Çıkışı</h1>

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
            {product.name} ({product.branch}) - Stok: {product.stock}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Çıkılacak Miktar"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
        }}
      />

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