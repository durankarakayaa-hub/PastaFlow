import { useEffect, useState } from "react";

function Waste() {
  const [branch, setBranch] = useState("");
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // =========================
  // GİRİŞ YAPAN KULLANICI
  // =========================

  const currentUser = JSON.parse(
    localStorage.getItem("pastaflow_user") || "null"
  );

  const isManager =
    currentUser?.role === "YONETICI";

  const userBranch =
    currentUser?.branch || "";

  // =========================
  // VERİLERİ YÜKLE
  // =========================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token =
        localStorage.getItem(
          "pastaflow_token"
        );

      const headers = {
        Authorization:
          "Bearer " + token,
      };

      // Ürünler
      const productsResponse =
        await fetch(
          "https://pastaflow.onrender.com/products",
          {
            headers,
          }
        );

      const productsData =
        await productsResponse.json();

      // Sadece aktif ürünler
      let activeProducts =
        productsData.filter(
          (item) =>
            item.status === "AKTIF"
        );

      // Personel sadece kendi şubesini görür
      if (!isManager) {
        activeProducts =
          activeProducts.filter(
            (item) =>
              item.branch === userBranch
          );
      }

      setProducts(
        activeProducts
      );

      // Şubeler
      const branchesResponse =
        await fetch(
          "https://pastaflow.onrender.com/branches",
          {
            headers,
          }
        );

      const branchesData =
        await branchesResponse.json();

      let activeBranches =
        branchesData.filter(
          (item) =>
            item.status === "AKTIF"
        );

      // Personel sadece kendi şubesini görür
      if (!isManager) {
        activeBranches =
          activeBranches.filter(
            (item) =>
              item.name ===
              userBranch
          );
      }

      setBranches(
        activeBranches
      );

      // Personel için şube otomatik seç
      if (
        !isManager &&
        userBranch
      ) {
        setBranch(
          userBranch
        );
      }

    } catch (error) {
      console.error(
        "İmha verileri yüklenemedi:",
        error
      );
    }
  };

  // =========================
  // ÜRÜN DEĞİŞİNCE
  // =========================

  const selectedProduct =
    products.find(
      (item) =>
        String(item.id) ===
        String(product)
    );

  // =========================
  // İMHA KAYDET
  // =========================

  const saveWaste = async () => {

    setMessage("");

    if (!branch) {
      setIsError(true);
      setMessage(
        "❌ Şube bilgisi bulunamadı."
      );
      return;
    }

    if (!product) {
      setIsError(true);
      setMessage(
        "❌ Lütfen bir ürün seçiniz."
      );
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      setIsError(true);
      setMessage(
        "❌ Geçerli bir miktar giriniz."
      );
      return;
    }

    if (!reason.trim()) {
      setIsError(true);
      setMessage(
        "❌ İmha sebebi zorunludur."
      );
      return;
    }

    // =========================
    // ÜRÜN KONTROLÜ
    // =========================

    if (!selectedProduct) {
      setIsError(true);
      setMessage(
        "❌ Ürün bulunamadı."
      );
      return;
    }

    // Personel kendi şubesi dışına çıkamaz
    if (
      !isManager &&
      selectedProduct.branch !==
        userBranch
    ) {
      setIsError(true);
      setMessage(
        "❌ Bu ürün için imha yetkiniz yok."
      );
      return;
    }

    // Seçilen şube ile ürün şubesi aynı mı?
    if (
      selectedProduct.branch !==
      branch
    ) {
      setIsError(true);
      setMessage(
        "❌ Ürün seçilen şubeye ait değil."
      );
      return;
    }

    // =========================
    // STOK KONTROLÜ
    // =========================

    if (
      Number(amount) >
      Number(selectedProduct.stock)
    ) {
      setIsError(true);
      setMessage(
        `❌ Yetersiz stok! Mevcut stok: ${selectedProduct.stock}`
      );
      return;
    }

    setLoading(true);

    try {
console.log(
  "🗑️ İMHA TOKEN:",
  localStorage.getItem("pastaflow_token")
);
      const response =
        await fetch(
          "https://pastaflow.onrender.com/waste",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                "Bearer " +
                localStorage.getItem(
                  "pastaflow_token"
                ),
            },

            body: JSON.stringify({
              product_id:
                Number(product),

              amount:
                Number(amount),

              reason:
                reason.trim(),

              description:
                description.trim(),

              created_by:
                currentUser?.name ||
                currentUser?.username ||
                "Kullanıcı",
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "İmha cevabı:",
        data
      );

      if (
        response.ok &&
        data.success
      ) {

        setIsError(false);

        setMessage(
          data.message ||
            "✅ İmha işlemi başarıyla tamamlandı."
        );

        setProduct("");
        setAmount("");
        setReason("");
        setDescription("");

        // Güncel stokları tekrar al
        loadData();

      } else {

        setIsError(true);

        setMessage(
          data.message ||
            "❌ İmha işlemi yapılamadı."
        );
      }

    } catch (error) {

      console.error(
        "İmha hatası:",
        error
      );

      setIsError(true);

      setMessage(
        "❌ Sunucuya bağlanırken hata oluştu."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "600px",
      }}
    >

      <h1>
        🗑️ İmha İşlemi
      </h1>

      {/* =========================
          KULLANICI / ŞUBE
      ========================= */}

      <div
        style={{
          background: "#f3f4f6",
          border:
            "1px solid #d1d5db",
          padding: "12px",
          borderRadius: "7px",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        👤{" "}
        {currentUser?.name ||
          "Kullanıcı"}

        {" | "}

        🏪{" "}
        {isManager
          ? "Tüm Şubeler"
          : userBranch}
      </div>

      {/* =========================
          MESAJ
      ========================= */}

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
            borderRadius: "7px",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      {/* =========================
          ŞUBE
      ========================= */}

      <label>
        <strong>Şube</strong>
      </label>

      {isManager ? (

        <select
          value={branch}
          onChange={(e) => {
  setBranch(e.target.value);
  setProduct("");
}}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
          }}
        >

          <option value="">
            Şube Seçiniz
          </option>

          {branches.map(
            (item) => (
              <option
                key={item.id}
                value={item.name}
              >
                {item.name}
              </option>
            )
          )}

        </select>

      ) : (

        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
            marginTop: "6px",
            background: "#eff6ff",
            border:
              "1px solid #93c5fd",
            borderRadius: "6px",
            color: "#1e40af",
            fontWeight: "bold",
          }}
        >
          🏪 {userBranch}
        </div>

      )}

      <br />

      {/* =========================
          ÜRÜN
      ========================= */}

      <label>
        <strong>Ürün</strong>
      </label>

      <select
        value={product}
        onChange={(e) =>
          setProduct(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "6px",
        }}
      >

        <option value="">
          Ürün Seçiniz
        </option>

        {products
          .filter(
            (item) =>
              item.branch ===
              branch
          )
          .map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
                {" - "}
                Stok:{" "}
                {item.stock}
              </option>
            )
          )}

      </select>

      <br />
      <br />

      {/* =========================
          MİKTAR
      ========================= */}

      <label>
        <strong>Miktar</strong>
      </label>

      <input
        type="number"
        min="1"
        value={amount}
        onChange={(e) =>
          setAmount(
            e.target.value
          )
        }
        placeholder="İmha miktarı"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "6px",
          boxSizing: "border-box",
        }}
      />

      {selectedProduct && (
        <div
          style={{
            marginTop: "6px",
            color: "#6b7280",
          }}
        >
          📦 Mevcut stok:{" "}
          <strong>
            {selectedProduct.stock}
          </strong>
        </div>
      )}

      <br />

      {/* =========================
          SEBEP
      ========================= */}

      <label>
        <strong>Sebep</strong>
      </label>

      <input
        type="text"
        value={reason}
        onChange={(e) =>
          setReason(
            e.target.value
          )
        }
        placeholder="Örn: Son kullanma tarihi"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "6px",
          boxSizing: "border-box",
        }}
      />

      <br />
      <br />

      {/* =========================
          AÇIKLAMA
      ========================= */}

      <label>
        <strong>Açıklama</strong>
      </label>

      <textarea
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
        placeholder="İsteğe bağlı açıklama"
        rows="4"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "6px",
          boxSizing: "border-box",
        }}
      />

      <br />
      <br />

      {/* =========================
          KAYDET
      ========================= */}

      <button
        onClick={saveWaste}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading
            ? "#9ca3af"
            : "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: loading
            ? "not-allowed"
            : "pointer",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        {loading
          ? "Kaydediliyor..."
          : "🗑️ İmhayı Kaydet"}
      </button>

    </div>
  );
}

export default Waste;