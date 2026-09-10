import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    setMessage("");

    if (!username || !password) {
      setIsError(true);
      setMessage("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:3001/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {

        setIsError(true);
        setMessage(
          data.message || "Giriş yapılamadı."
        );

        setLoading(false);
        return;
      }

      // TOKEN'I KAYDET
      localStorage.setItem(
        "pastaflow_token",
        data.token
      );

      // KULLANICI BİLGİLERİNİ KAYDET
      localStorage.setItem(
        "pastaflow_user",
        JSON.stringify(data.user)
      );

      console.log("✅ Giriş başarılı:", data.user);

      setIsError(false);
      setMessage("✅ Giriş başarılı. Yönlendiriliyorsunuz...");

      setTimeout(() => {
        navigate("/");
      }, 500);

    } catch (error) {

      console.error(error);

      setIsError(true);
      setMessage(
        "Sunucuya bağlanılamadı."
      );

    }

    setLoading(false);
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
        padding: "20px",
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "35px",
          borderRadius: "15px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.10)",
        }}
      >

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >

          <div
            style={{
              fontSize: "50px",
              marginBottom: "10px",
            }}
          >
            🥐
          </div>

          <h1
            style={{
              margin: 0,
              color: "#111827",
            }}
          >
            PastaFlow
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            PastaFlow Yönetim Sistemi
          </p>

        </div>

        {message && (

          <div
            style={{
              background: isError
                ? "#fee2e2"
                : "#dcfce7",

              color: isError
                ? "#991b1b"
                : "#166534",

              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {message}
          </div>

        )}

        <form onSubmit={handleLogin}>

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
            }}
          >
            Kullanıcı Adı
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="Kullanıcı adınızı giriniz"
            autoComplete="username"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "7px",
              boxSizing: "border-box",
              marginBottom: "18px",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
            }}
          >
            Şifre
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Şifrenizi giriniz"
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "7px",
              boxSizing: "border-box",
              marginBottom: "22px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: loading
                ? "#93c5fd"
                : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "7px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {loading
              ? "Giriş yapılıyor..."
              : "🔐 Giriş Yap"}
          </button>

        </form>

      </div>

    </div>

  );
}

export default Login;