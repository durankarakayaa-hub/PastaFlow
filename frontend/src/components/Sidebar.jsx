import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        background: "#1f2937",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2>🍰 PastaFlow</h2>

      <hr />

      <Link to="/" style={linkStyle}>🏠 Genel Özet</Link>
      <Link to="/stock" style={linkStyle}>📦 Stok Takibi</Link>
      <Link to="/products" style={linkStyle}>
  📋 Ürün Yönetimi
</Link>
      <Link to="/stock-in" style={linkStyle}>📥 Stok Girişi</Link>
      <Link to="/stock-out" style={linkStyle}>📤 Stok Çıkışı</Link>
      <Link to="/waste" style={linkStyle}>🗑️ İmha</Link>
      <Link to="/transfer" style={linkStyle}>🚚 Transfer</Link>
      <Link to="/movements" style={linkStyle}>
  📜 Hareketler
</Link>
      <Link to="/reports" style={linkStyle}>📊 Raporlar</Link>
      <Link to="/settings" style={linkStyle}>⚙️ Ayarlar</Link>
    </div>
  );
}

const linkStyle = {
  display: "block",
  color: "white",
  textDecoration: "none",
  padding: "10px 0",
  fontSize: "18px",
};

export default Sidebar;