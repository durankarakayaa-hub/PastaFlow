import { useEffect, useState } from "react";

function Transfer() {
  const [products, setProducts] = useState([]);
  const [fromProduct, setFromProduct] = useState("");
  const [toProduct, setToProduct] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const response = await fetch("http://localhost:3001/products");
    const data = await response.json();
    setProducts(data);
  };

  const transferStock = async () => {
    if (!fromProduct || !toProduct) {
      alert("Lütfen gönderen ve alan ürünü seçiniz.");
      return;
    }

    if (fromProduct === toProduct) {
      alert("Aynı ürün arasında transfer yapılamaz.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Geçerli bir miktar giriniz.");
      return;
    }
console.log("TRANSFER BUTONU ÇALIŞTI");
console.log("API'YE İSTEK ATIYORUM");
    const response = await fetch(
      "http://localhost:3001/products/transfer",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromProductId: fromProduct,
          toProductId: toProduct,
          amount: Number(amount),
        }),
      }
    );
console.log("CEVAP GELDİ", response.status);
    const data = await response.json();

    if (data.success) {
      alert("✅ Transfer başarılı!");

      setFromProduct("");
      setToProduct("");
      setAmount("");

      loadProducts();
    } else {
      alert("❌ Transfer yapılamadı.");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h1>🚚 Transfer</h1>

      <select
        value={fromProduct}
        onChange={(e) => setFromProduct(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      >
        <option value="">Gönderen Ürün</option>

        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} ({product.branch}) - Stok: {product.stock}
          </option>
        ))}
      </select>


      <select
        value={toProduct}
        onChange={(e) => setToProduct(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      >
        <option value="">Alan Ürün</option>

        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} ({product.branch}) - Stok: {product.stock}
          </option>
        ))}
      </select>


      <input
        type="number"
        placeholder="Transfer Miktarı"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
        }}
      />


      <button
        onClick={transferStock}
        style={{
          width: "100%",
          padding: "12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        🚚 Transfer Yap
      </button>

    </div>
  );
}

export default Transfer;