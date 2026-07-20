import { useState } from "react";

function ProductManagement() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [branch, setBranch] = useState("");
  const [stock, setStock] = useState("");
  const [critical, setCritical] = useState("");
const saveProduct = async () => {
  const response = await fetch("http://localhost:3001/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      category,
      branch,
      stock: Number(stock),
      critical: Number(critical),
    }),
  });

  const data = await response.json();

  if (data.success) {
    alert("✅ Ürün başarıyla eklendi!");

    setName("");
    setCategory("");
    setBranch("");
    setStock("");
    setCritical("");
  } else {
    alert("❌ Ürün eklenemedi.");
  }
};
  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h1>📥 Yeni Ürün Ekle</h1>

      <input
        type="text"
        placeholder="Ürün Adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="text"
        placeholder="Kategori"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

     <select
  value={branch}
  onChange={(e) => setBranch(e.target.value)}
  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
>
  <option value="">Şube Seçiniz</option>
  <option value="Aksaray">Aksaray</option>
  <option value="Bahçelievler">Bahçelievler</option>
  <option value="Ankara">Ankara</option>
</select>
      <input
        type="number"
        placeholder="Stok"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="number"
        placeholder="Kritik Stok"
        value={critical}
        onChange={(e) => setCritical(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
      />

      <button
  onClick={saveProduct}
        style={{
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Ürünü Kaydet
      </button>
    </div>
  );
}

export default ProductManagement;