import { useState } from "react";
import logoImportService from "../services/logoImportService";
import * as XLSX from "xlsx";
function LogoImport() {
    const [fileName, setFileName] = useState("");
    const testBackendConnection = async () => {
  try {
    if (!selectedFile) {
      alert("Lütfen önce bir Excel dosyası seç.");
      return;
    }

    const result = await logoImportService.uploadExcel(selectedFile);
setProducts(result.products || []);
    alert(result.message);
  } catch (error) {
    console.error(error);
    alert("Dosya gönderilemedi.");
  }
};
const [previewData, setPreviewData] = useState([]);
const [selectedFile, setSelectedFile] = useState(null);
const [products, setProducts] = useState([]);
const handleFileChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;
setSelectedFile(file);
  setFileName(file.name);
};
const handleConfirmImport = async () => {
  const result = await logoImportService.confirmSave();

  alert(result.message);
};
  return (
    <div style={{ padding: "30px" }}>
      <h1>📂 LOGO Excel İçe Aktarma</h1>

      <p style={{ color: "#666", marginBottom: "20px" }}>
        LOGO'dan aldığınız Excel dosyasını seçerek ürün ve stok bilgilerini
        PastaFlow'a aktarabilirsiniz.
      </p>

      <input
  type="file"
  accept=".xlsx,.xls"
  onChange={handleFileChange}
/>

      <br /><br />

      <button
  onClick={testBackendConnection}
  style={{
    padding: "10px 20px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  📤 İçe Aktar
</button>
{products.length > 0 && (
  <div style={{ marginTop: "30px" }}>
    <h3>📦 LOGO Önizleme</h3>

    <p>Toplam gösterilen ürün: {products.length}</p>
    <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  }}
>
  <thead>
    <tr>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Ürün</th>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Birim</th>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>Şube</th>
      <th style={{ border: "1px solid #ddd", padding: "8px" }}>
  Stok
</th>

<th style={{ border: "1px solid #ddd", padding: "8px" }}>
  Son Hareket
</th>
    </tr>
  </thead>

  <tbody>
    {products.map((product, index) => (
      <tr key={index}>
        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
          {product.name}
        </td>

        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
          {product.unit}
        </td>

        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
          {product.branch}
        </td>

        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
          {product.stock}
        </td>
        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
  {product.lastMovement || "-"}
</td>
      </tr>
    ))}
  </tbody>
</table>

<button
  onClick={handleConfirmImport}
  style={{
    marginTop: "20px",
    padding: "12px 25px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  }}
>
  ✅ İçe Aktarmayı Onayla
</button>
  </div>
)}
    </div>
  );
}

export default LogoImport;