import { Link, useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("pastaflow_user") || "null"
  );

  const role = user?.role || "";

  const isAdmin =
    role === "ADMIN" ||
    role === "YÖNETİCİ" ||
    role === "YONETICI";

  const isManager =
    isAdmin ||
    role === "MUDUR" ||
    role === "MÜDÜR";

  const handleLogout = () => {

    localStorage.removeItem("pastaflow_token");
    localStorage.removeItem("pastaflow_user");

    navigate("/login");
  };

  return (

    <div
      style={{
        width: "250px",
        background: "#1f2937",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >

      <h2>🍰 PastaFlow</h2>

      <div
        style={{
          background: "#374151",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "15px",
        }}
      >

        <div style={{ fontWeight: "bold" }}>
          👤 {user?.name || user?.fullname || "Kullanıcı"}
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#d1d5db",
            marginTop: "4px",
          }}
        >
          🎭 {role || "Rol belirtilmemiş"}
        </div>

        {user?.branch && (
          <div
            style={{
              fontSize: "13px",
              color: "#d1d5db",
              marginTop: "3px",
            }}
          >
            🏪 {user.branch}
          </div>
        )}

      </div>

      <hr />

      <Link to="/" style={linkStyle}>
        🏠 Genel Özet
      </Link>

      <Link to="/stock" style={linkStyle}>
        📦 Stok Takibi
      </Link>

      <Link to="/products" style={linkStyle}>
        📋 Ürün Yönetimi
      </Link>

      <Link to="/stock-in" style={linkStyle}>
        📥 Stok Girişi
      </Link>

      <Link to="/stock-out" style={linkStyle}>
        📤 Stok Çıkışı
      </Link>

      <Link to="/waste" style={linkStyle}>
        🗑️ İmha
      </Link>

      <Link to="/transfer" style={linkStyle}>
        🚚 Transfer
      </Link>

      <Link to="/movements" style={linkStyle}>
        📜 Hareketler
      </Link>

      <Link to="/reports" style={linkStyle}>
        📊 Raporlar
      </Link>

      {isAdmin && (
        <>
          <div
            style={{
              marginTop: "10px",
              marginBottom: "5px",
              color: "#9ca3af",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            YÖNETİM
          </div>

          <Link to="/settings" style={linkStyle}>
            ⚙️ Ayarlar
          </Link>

          <Link to="/branches" style={linkStyle}>
            🏪 Şube Yönetimi
          </Link>

          <Link to="/users" style={linkStyle}>
            👥 Kullanıcı Yönetimi
          </Link>

          <Link to="/logo-import" style={linkStyle}>
            📁 LOGO Aktar
          </Link>
        </>
      )}

      <div style={{ marginTop: "auto" }}>

        <hr />

        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
        >
          🚪 Çıkış Yap
        </button>

      </div>

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

const logoutButtonStyle = {
  width: "100%",
  padding: "12px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export default Sidebar;