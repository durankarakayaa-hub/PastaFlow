import { useState, useEffect } from "react";
function EditProductModal({
  product,
  onClose,
  onRefresh,
}) {
  const [name, setName] = useState("");
const [category, setCategory] = useState("");
const [branch, setBranch] = useState("");
const [stock, setStock] = useState("");
const [critical, setCritical] = useState("");

useEffect(() => {
  if (product) {
    setName(product.name);
    setCategory(product.category);
    setBranch(product.branch);
    setStock(product.stock);
    setCritical(product.critical);
  }
}, [product]);
const saveProduct = async () => {
  const response = await fetch(
    `https://pastaflow.onrender.com/products/${product.id}`,
    {
      method: "PUT",
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
    }
  );

  const data = await response.json();

  if (data.success) {
    alert("✅ Ürün güncellendi.");

    onRefresh();
  } else {
    alert("❌ Güncelleme başarısız.");
  }
};
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          width: "450px",
        }}
      >
        <h2>✏️ Ürün Düzenle</h2>

        <input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Ürün Adı"
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  }}
/>

<input
  type="text"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  placeholder="Kategori"
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  }}
/>

<select
  value={branch}
  onChange={(e) => setBranch(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  }}
>
  <option value="Aksaray">Aksaray</option>
  <option value="Bahçelievler">Bahçelievler</option>
  <option value="Ankara">Ankara</option>
</select>

<input
  type="number"
  value={stock}
  onChange={(e) => setStock(e.target.value)}
  placeholder="Stok"
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  }}
/>

<input
  type="number"
  value={critical}
  onChange={(e) => setCritical(e.target.value)}
  placeholder="Kritik Stok"
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
  }}
/>

<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  }}
>
  <button
  onClick={onClose}
  style={{
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  }}
>
  Kapat
</button>

  <button
  onClick={saveProduct}
    style={{
      background: "#2563eb",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Kaydet
  </button>
</div>
      </div>
    </div>
  );
}

export default EditProductModal;