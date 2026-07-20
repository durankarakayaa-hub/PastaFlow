import { useEffect, useState } from "react";
import {
  getProducts,
  deleteProduct as deleteProductService,
} from "../services/productService";
import EditProductModal from "../components/EditProductModal";
function Stock() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
const [selectedProduct, setSelectedProduct] = useState(null);
const [sortField, setSortField] = useState("");
const [sortOrder, setSortOrder] = useState("asc");
const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
  const data = await getProducts();
  setProducts(data);
};
  const handleSort = (field) => {
  if (sortField === field) {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  } else {
    setSortField(field);
    setSortOrder("asc");
  }
};
const deleteProduct = async (id) => {
  const cevap = window.confirm("Bu ürünü silmek istediğinize emin misiniz?");

  if (!cevap) return;

  const data = await deleteProductService(id);

  if (data.success) {
    alert("✅ Ürün silindi.");
    loadProducts();
  } else {
    alert("❌ Ürün silinemedi.");
  }
};
  return (
    <div style={{ padding: "30px" }}>
      <h1>📦 Stok Takibi</h1>
<input
  type="text"
  placeholder="🔍 Ürün Ara..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "300px",
    padding: "10px",
    marginTop: "20px",
    marginBottom: "20px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
/>

<select
  value={selectedBranch}
  onChange={(e) => setSelectedBranch(e.target.value)}
  style={{
    width: "200px",
    padding: "10px",
    marginLeft: "15px",
    marginBottom: "20px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
>
  <option value="">Tüm Şubeler</option>
  <option value="Aksaray">Aksaray</option>
  <option value="Bahçelievler">Bahçelievler</option>
  <option value="Ankara">Ankara</option>
</select>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "25px",
        }}
      >
        <thead>
          <tr style={{ background: "#2563eb", color: "white" }}>
            <th
  style={{ ...cellStyle, cursor: "pointer" }}
  onClick={() => handleSort("name")}
>
  Ürün ↕
</th>
            <th style={cellStyle}>Kategori</th>
            <th style={cellStyle}>Şube</th>
            <th
  style={{ ...cellStyle, cursor: "pointer" }}
  onClick={() => handleSort("stock")}
>
  Mevcut ↕
</th>
            <th
  style={{ ...cellStyle, cursor: "pointer" }}
  onClick={() => handleSort("critical")}
>
  Kritik ↕
</th>
            <th style={cellStyle}>Durum</th>
            <th style={cellStyle}>İşlem</th>
          </tr>
        </thead>

        <tbody>
  {[...products]
    .filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((product) =>
      selectedBranch === "" || product.branch === selectedBranch
    )
    .sort((a, b) => {
      if (!sortField) return 0;

      if (a[sortField] < b[sortField]) {
        return sortOrder === "asc" ? -1 : 1;
      }

      if (a[sortField] > b[sortField]) {
        return sortOrder === "asc" ? 1 : -1;
      }

      return 0;
    })
    .map((product) => (
            <tr key={product.id}>
              <td style={cellStyle}>{product.name}</td>
              <td style={cellStyle}>{product.category}</td>
              <td style={cellStyle}>{product.branch}</td>
              <td style={cellStyle}>{product.stock}</td>
              <td style={cellStyle}>{product.critical}</td>
              <td style={cellStyle}>
                {product.stock <= product.critical
                  ? "🔴 Kritik"
                  : "🟢 Normal"}
              </td>
              <td style={cellStyle}>
                <button
                onClick={() => {
  setSelectedProduct(product);
  setIsEditing(true);
}}
  style={{
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "8px",
  }}
>
  ✏️ Düzenle
</button>
  <button
    onClick={() => deleteProduct(product.id)}
    style={{
      backgroundColor: "#dc2626",
      color: "white",
      border: "none",
      padding: "6px 12px",
      borderRadius: "5px",
      cursor: "pointer",
    }}
  >
    🗑️ Sil
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
   {isEditing && (
  <EditProductModal
    product={selectedProduct}
    onClose={() => setIsEditing(false)}
    onRefresh={() => {
      loadProducts();
      setIsEditing(false);
    }}
  />
)}
    </div>
  );
}

const cellStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "center",
};

export default Stock;