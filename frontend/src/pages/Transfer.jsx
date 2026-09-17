import { useEffect, useState } from "react";

function Transfer() {
  const [products, setProducts] = useState([]);
  const [fromProduct, setFromProduct] = useState("");
  const [toProduct, setToProduct] = useState("");
  const [amount, setAmount] = useState("");

  const [branches, setBranches] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");

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
  // SEÇİLEN GÖNDEREN ÜRÜN
  // =========================

  const selectedFromProduct =
    products.find(
      (p) =>
        p.id === Number(fromProduct)
    );

  const stockExceeded =
    selectedFromProduct &&
    Number(amount) >
      Number(selectedFromProduct.stock);

  // =========================
  // VERİLERİ YÜKLE
  // =========================

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const token =
        localStorage.getItem(
          "pastaflow_token"
        );

      const headers = {
        Authorization:
          "Bearer " + token,
      };

      const [
        productsResponse,
        branchesResponse,
      ] = await Promise.all([
        fetch(
          "https://pastaflow.onrender.com/products",
          { headers }
        ),
        fetch(
          "https://pastaflow.onrender.com/branches",
          { headers }
        ),
      ]);

      const productsData =
        await productsResponse.json();

      const branchesData =
        await branchesResponse.json();

      // =========================
      // SADECE AKTİF ÜRÜNLER
      // =========================

      const activeProducts =
  productsData.filter(
    (product) =>
      product.status === "AKTIF"
  );

setProducts(activeProducts);

      setProducts(
        activeProducts
      );

      // =========================
      // AKTİF ŞUBELER
      // =========================

      let activeBranches =
        branchesData.filter(
          (branch) =>
            branch.status === "AKTIF"
        );

      setBranches(
        activeBranches
      );

      // =========================
      // PERSONEL İÇİN GÖNDEREN ŞUBE
      // OTOMATİK KENDİ ŞUBESİ
      // =========================

      if (
        !isManager &&
        userBranch
      ) {
        setFromBranch(
          userBranch
        );
      }

    } catch (error) {
      console.error(
        "Transfer verileri yüklenemedi:",
        error
      );
    }
  };

  // =========================
  // TRANSFER
  // =========================

  const transferStock = async () => {

    setLoading(true);
    setMessage("");

    // =========================
    // GÖNDEREN ŞUBE
    // =========================

    if (!fromBranch) {
      setLoading(false);
      setIsError(true);
      setMessage(
        "❌ Gönderen şube seçilmelidir."
      );
      return;
    }

    // =========================
    // HEDEF ŞUBE
    // =========================

    if (!toBranch) {
      setLoading(false);
      setIsError(true);
      setMessage(
        "❌ Hedef şube seçilmelidir."
      );
      return;
    }

    // Aynı şube kontrolü
    if (
      fromBranch === toBranch
    ) {
      setLoading(false);
      setIsError(true);
      setMessage(
        "❌ Gönderen ve hedef şube aynı olamaz."
      );
      return;
    }

    // =========================
    // PERSONEL ŞUBE KONTROLÜ
    // =========================

    if (
      !isManager &&
      fromBranch !== userBranch
    ) {
      setLoading(false);
      setIsError(true);
      setMessage(
        "❌ Sadece kendi şubenizden transfer yapabilirsiniz."
      );
      return;
    }

    // =========================
    // ÜRÜN KONTROLLERİ
    // =========================

    if (!fromProduct) {
  setLoading(false);
  alert("Lütfen gönderen ürünü seçiniz.");
  return;
}

    if (
      fromProduct === toProduct
    ) {
      setLoading(false);
      setIsError(true);
      setMessage(
        "❌ Aynı ürün arasında transfer yapılamaz."
      );
      return;
    }

    // =========================
    // SEÇİLEN ÜRÜNLER
    // =========================

    const fromProductData =
      products.find(
        (p) =>
          p.id ===
          Number(fromProduct)
      );

    const toProductData =
  products.find(
    (p) =>
      p.id ===
      Number(toProduct)
  );

if (!fromProductData) {
  setLoading(false);
  setIsError(true);
  setMessage(
    "❌ Gönderen ürün bulunamadı."
  );
  return;
}

// =========================
// ÜRÜN - ŞUBE KONTROLÜ
// =========================

if (
  fromProductData.branch !==
  fromBranch
) {
  setLoading(false);
  setIsError(true);
  setMessage(
    "❌ Gönderen ürün seçilen şubeye ait değil."
  );
  return;
}

// Hedef ürün varsa şube kontrolü yap
if (
  toProductData &&
  toProductData.branch !==
    toBranch
) {
  setLoading(false);
  setIsError(true);
  setMessage(
    "❌ Hedef ürün seçilen şubeye ait değil."
  );
  return;
}

// =========================
// MİKTAR
// =========================

if (
  !amount ||
  Number(amount) <= 0
) {
  setLoading(false);
  setIsError(true);
  setMessage(
    "❌ Geçerli bir transfer miktarı giriniz."
  );
  return;
}

// =========================
// STOK
// =========================

if (
  Number(amount) >
  Number(fromProductData.stock)
) {
  setLoading(false);
  setIsError(true);
  setMessage(
    `❌ Yetersiz stok! Mevcut stok: ${fromProductData.stock}`
  );
  return;
}

try {

      const response =
        await fetch(
          "https://pastaflow.onrender.com/products/transfer",
          {
            method: "PUT",

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
  fromProductId: fromProduct,
  toProductId: toProduct || null,
  toBranch: toBranch,
  amount: Number(amount),
}),
          }
        );

      console.log(
        "TRANSFER CEVAP:",
        response.status
      );

      const data =
        await response.json();

      if (
        response.ok &&
        data.success
      ) {

        setIsError(false);

        setMessage(
          data.message ||
            "✅ Transfer başarıyla tamamlandı."
        );

        setToBranch("");
        setFromProduct("");
        setToProduct("");
        setAmount("");

        if (!isManager) {
          setFromBranch(
            userBranch
          );
        } else {
          setFromBranch("");
        }

        loadProducts();

      } else {

        setIsError(true);

        setMessage(
          data.message ||
            "❌ Transfer yapılamadı."
        );
      }

    } catch (error) {

      console.error(
        "Transfer hatası:",
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
        maxWidth: "500px",
      }}
    >

      {/* MESAJ */}

      {message && (
        <div
          style={{
            background: isError
              ? "#fee2e2"
              : "#dcfce7",

            color: isError
              ? "#991b1b"
              : "#166534",

            padding: "10px",
            borderRadius: "5px",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      <h1>
        🚚 Transfer
      </h1>

      {/* KULLANICI BİLGİSİ */}

      <div
        style={{
          background: "#f3f4f6",
          border:
            "1px solid #d1d5db",
          padding: "10px",
          borderRadius: "6px",
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
          ? "Yönetici - Tüm Şubeler"
          : userBranch}
      </div>

      {/* GÖNDEREN ŞUBE */}

      <label>
        <strong>
          Gönderen Şube
        </strong>
      </label>

      {isManager ? (

        <select
          value={fromBranch}
          onChange={(e) => {
            setFromBranch(
              e.target.value
            );
            setFromProduct("");
          }}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            marginTop: "6px",
          }}
        >

          <option value="">
            Gönderen Şube
          </option>

          {branches.map(
            (branch) => (
              <option
                key={branch.id}
                value={branch.name}
              >
                {branch.name}
              </option>
            )
          )}

        </select>

      ) : (

        <div
          style={{
            background: "#eff6ff",
            border:
              "1px solid #93c5fd",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
            color: "#1e40af",
            fontWeight: "bold",
          }}
        >
          🏪 {userBranch}
        </div>

      )}

      {/* GÖNDEREN ÜRÜN */}

      <select
        value={fromProduct}
        onChange={(e) =>
          setFromProduct(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      >

        <option value="">
          Gönderen Ürün
        </option>

        {products
          .filter(
            (product) =>
              product.branch ===
              fromBranch
          )
          .map(
            (product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
                {" - "}
                Stok:{" "}
                {product.stock}
              </option>
            )
          )}

      </select>

      {selectedFromProduct && (
        <div
          style={{
            marginBottom: "15px",
            color: "#2563eb",
            fontWeight: "bold",
          }}
        >
          📦 Mevcut Stok:{" "}
          {
            selectedFromProduct.stock
          }
        </div>
      )}

      {/* HEDEF ŞUBE */}

      <label>
        <strong>
          Hedef Şube
        </strong>
      </label>

      <select
        value={toBranch}
        onChange={(e) => {
          setToBranch(
            e.target.value
          );
          setToProduct("");
        }}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          marginTop: "6px",
        }}
      >

        <option value="">
          Hedef Şube
        </option>

        {branches
          .filter(
            (branch) =>
              branch.name !==
              fromBranch
          )
          .map(
            (branch) => (
              <option
                key={branch.id}
                value={branch.name}
              >
                {branch.name}
              </option>
            )
          )}

      </select>

      {/* HEDEF ÜRÜN */}

      <select
        value={toProduct}
        onChange={(e) =>
          setToProduct(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      >

        <option value="">
          Alan Ürün
        </option>

      {products
  .filter(
    (product) =>
      product.branch === toBranch &&
      selectedFromProduct &&
      product.name.trim().toLowerCase() ===
        selectedFromProduct.name.trim().toLowerCase()
  )
  .map((product) => (
    <option key={product.id} value={product.id}>
      {product.name} - Stok: {product.stock}
    </option>
  ))}

      </select>
{toBranch &&
  selectedFromProduct &&
  !products.some(
    (product) =>
      product.branch === toBranch &&
      product.name.trim().toLowerCase() ===
        selectedFromProduct.name.trim().toLowerCase()
  ) && (
    <div
      style={{
        marginBottom: "15px",
        padding: "10px",
        background: "#fff3cd",
        color: "#856404",
        borderRadius: "6px",
        fontWeight: "bold",
      }}
    >
      🆕 {selectedFromProduct.name} bu şubede bulunmuyor.
      <br />
      Transfer sonrası yeni ürün olarak oluşturulacak.
    </div>
  )}
      {/* MİKTAR */}

      <input
        type="number"
        min="1"
        placeholder="Transfer Miktarı"
        value={amount}
        onChange={(e) =>
          setAmount(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          boxSizing: "border-box",
        }}
      />

      {stockExceeded && (
        <div
          style={{
            color: "red",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
          ❌ Girilen miktar mevcut
          stoktan fazla.
        </div>
      )}

      {/* TRANSFER */}

      <button
        disabled={
          loading ||
          stockExceeded
        }
        onClick={
          transferStock
        }
        style={{
          width: "100%",
          padding: "12px",
          background:
            loading ||
            stockExceeded
              ? "#9ca3af"
              : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor:
            loading ||
            stockExceeded
              ? "not-allowed"
              : "pointer",
          fontWeight: "bold",
        }}
      >
        {loading
          ? "Transfer Yapılıyor..."
          : "🚚 Transfer Yap"}
      </button>

    </div>
  );
}

export default Transfer;