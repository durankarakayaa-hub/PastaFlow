import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
function Reports() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);

  const [branch, setBranch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));

    fetch("http://localhost:3001/movements")
      .then((res) => res.json())
      .then((data) => setMovements(data));
  }, []);

  const createReport = () => {
    let filteredProducts = [...products];
    let filteredMovements = [...movements];

    // Şube filtresi
    if (branch !== "") {
      filteredProducts = filteredProducts.filter(
        (p) => p.branch === branch
      );

      filteredMovements = filteredMovements.filter(
        (m) =>
          m.from_branch === branch ||
          m.to_branch === branch
      );
    }

    // Tarih filtresi
    if (startDate !== "") {
      filteredMovements = filteredMovements.filter(
        (m) => m.created_at.slice(0, 10) >= startDate
      );
    }

    if (endDate !== "") {
      filteredMovements = filteredMovements.filter(
        (m) => m.created_at.slice(0, 10) <= endDate
      );
    }

    setReport({
      totalProducts: filteredProducts.length,

      criticalProducts: filteredProducts.filter(
        (p) => p.stock <= p.critical
      ).length,

      stockIn: filteredMovements.filter(
        (m) => m.type === "STOK GİRİŞİ"
      ).length,

      stockOut: filteredMovements.filter(
        (m) => m.type === "STOK ÇIKIŞI"
      ).length,

      transfer: filteredMovements.filter(
        (m) => m.type === "TRANSFER"
      ).length,

      totalStock: filteredProducts.reduce(
        (toplam, p) => toplam + p.stock,
        0
      ),
    });
  };
const exportPDF = () => {
  if (!report) {
    alert("Önce rapor oluşturmalısınız.");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("PastaFlow Stok Raporu", 14, 20);

  doc.setFontSize(11);
  doc.text(`Şube: ${branch || "Tüm Şubeler"}`, 14, 35);
  doc.text(`Başlangıç: ${startDate || "-"}`, 14, 42);
  doc.text(`Bitiş: ${endDate || "-"}`, 14, 49);

  autoTable(doc, {
    startY: 60,
    head: [["Bilgi", "Değer"]],
    body: [
      ["Toplam Ürün", report.totalProducts],
      ["Toplam Stok", report.totalStock],
      ["Kritik Ürün", report.criticalProducts],
      ["Stok Girişi", report.stockIn],
      ["Stok Çıkışı", report.stockOut],
      ["Transfer", report.transfer],
    ],
  });

  doc.save("PastaFlow-Rapor.pdf");
};
const exportExcel = () => {
  if (!report) {
    alert("Önce rapor oluşturmalısınız.");
    return;
  }

  const excelData = [
    { Bilgi: "Şube", Değer: branch || "Tüm Şubeler" },
    { Bilgi: "Toplam Ürün", Değer: report.totalProducts },
    { Bilgi: "Toplam Stok", Değer: report.totalStock },
    { Bilgi: "Kritik Ürün", Değer: report.criticalProducts },
    { Bilgi: "Stok Girişi", Değer: report.stockIn },
    { Bilgi: "Stok Çıkışı", Değer: report.stockOut },
    { Bilgi: "Transfer", Değer: report.transfer },
  ];

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Rapor"
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const data = new Blob(
    [excelBuffer],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  saveAs(data, "PastaFlow-Rapor.xlsx");
};
  return (
    <div style={{ padding: "30px" }}>
      <h1>📊 Raporlar</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: "15px",
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >
        <div className="card">
          <h3>📦 Toplam Ürün</h3>
          <h2>{products.length}</h2>
        </div>

        <div className="card">
          <h3>⚠ Kritik</h3>
          <h2>{products.filter((p) => p.stock <= p.critical).length}</h2>
        </div>

        <div className="card">
          <h3>📥 Giriş</h3>
          <h2>{movements.filter((m) => m.type === "STOK GİRİŞİ").length}</h2>
        </div>

        <div className="card">
          <h3>📤 Çıkış</h3>
          <h2>{movements.filter((m) => m.type === "STOK ÇIKIŞI").length}</h2>
        </div>

        <div className="card">
          <h3>🚚 Transfer</h3>
          <h2>{movements.filter((m) => m.type === "TRANSFER").length}</h2>
        </div>
      </div>

      <h2>Filtreler</h2>

      <select
        value={branch}
        onChange={(e) => setBranch(e.target.value)}
        style={{ padding: "10px", marginRight: "15px" }}
      >
        <option value="">Tüm Şubeler</option>
        <option value="Aksaray">Aksaray</option>
        <option value="Bahçelievler">Bahçelievler</option>
        <option value="Ankara">Ankara</option>
      </select>

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        style={{ padding: "10px", marginRight: "15px" }}
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        style={{ padding: "10px" }}
      />

      <br />
      <br />

      <button
        onClick={createReport}
        style={{
          padding: "12px 25px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        📊 Rapor Oluştur
      </button>
<button
  onClick={exportPDF}
  style={{
    padding: "12px 25px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px",
  }}
>
  📄 PDF İndir
</button>
<button
  onClick={exportExcel}
  style={{
    padding: "12px 25px",
    background: "#15803d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px",
  }}
>
  📗 Excel'e Aktar
</button>
      {report && (
        <div
          style={{
            marginTop: "35px",
            background: "#f8fafc",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            padding: "25px",
          }}
        >
          <h2>📋 Rapor Sonucu</h2>

          <p><strong>🏪 Şube:</strong> {branch || "Tüm Şubeler"}</p>
          <p><strong>📦 Toplam Ürün:</strong> {report.totalProducts}</p>
          <p><strong>📈 Toplam Stok:</strong> {report.totalStock}</p>
          <p><strong>⚠ Kritik Ürün:</strong> {report.criticalProducts}</p>
          <p><strong>📥 Stok Girişi:</strong> {report.stockIn}</p>
          <p><strong>📤 Stok Çıkışı:</strong> {report.stockOut}</p>
          <p><strong>🚚 Transfer:</strong> {report.transfer}</p>
        </div>
      )}
    </div>
  );
}

export default Reports;