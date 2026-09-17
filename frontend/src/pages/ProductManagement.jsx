import { useEffect, useState } from "react";

function ProductManagement() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [branch, setBranch] = useState("");
  const [stock, setStock] = useState("");
  const [critical, setCritical] = useState("");
const [unit, setUnit] = useState("ADET");
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);

  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [criticalOnly, setCriticalOnly] = useState(false);

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
  // ŞUBELERİ YÜKLE
  // =========================

  const loadBranches = async () => {
    try {
      const response = await fetch(
        "https://pastaflow.onrender.com/branches"
      );

      const data = await response.json();

      setBranches(data);

      // PERSONEL İSE KENDİ ŞUBESİ OTOMATİK SEÇİLSİN
      if (!isManager && userBranch) {
        setBranch(userBranch);
        setBranchFilter(userBranch);
      }

    } catch (error) {
      console.error(
        "Şubeler alınamadı:",
        error
      );
    }
  };

  // =========================
  // ÜRÜNLERİ YÜKLE
  // =========================

  const loadProducts = async () => {
    try {
      const response = await fetch(
        "https://pastaflow.onrender.com/products"
      );

      const data = await response.json();

      setProducts(data);

    } catch (error) {
      console.error(
        "Ürünler alınamadı:",
        error
      );
    }
  };

  useEffect(() => {
    loadBranches();
    loadProducts();
  }, []);

  // =========================
  // ÜRÜN KAYDET / GÜNCELLE
  // =========================

  const saveProduct = async () => {

    // PERSONEL İSE ŞUBEYİ ZORLA KENDİ ŞUBESİ YAP
    const selectedBranch =
      isManager
        ? branch
        : userBranch;

    if (
      !name ||
      !category ||
      !selectedBranch
    ) {
      alert(
        "❌ Ürün adı, kategori ve şube zorunludur."
      );
      return;
    }

    const url = editingId
      ? `https://pastaflow.onrender.com/products/${editingId}`
      : "https://pastaflow.onrender.com/products";

    const method = editingId
      ? "PUT"
      : "POST";

    try {

      const response = await fetch(
        url,
        {
          method,
          headers: {
  "Content-Type": "application/json",
  Authorization:
    "Bearer " +
    localStorage.getItem("pastaflow_token"),
},

          body: JSON.stringify({
  name,
  category,
  unit,
  branch: selectedBranch,
  stock: Number(stock) || 0,
  critical: Number(critical) || 0,
}),
        }
      );

      const data =
        await response.json();

      if (data.success) {

        alert(
          editingId
            ? "✅ Ürün başarıyla güncellendi!"
            : "✅ Ürün başarıyla eklendi!"
        );

        setName("");
        setCategory("");
setUnit("ADET");
        if (isManager) {
          setBranch("");
        } else {
          setBranch(userBranch);
        }

        setStock("");
        setCritical("");
        setEditingId(null);

        loadProducts();

      } else {

        alert(
          data.message ||
          "❌ İşlem başarısız."
        );

      }

    } catch (error) {

      console.error(error);

      alert(
        "❌ Sunucuya bağlanılamadı."
      );

    }
  };

  // =========================
  // ÜRÜN AKTİF / PASİF
  // =========================

  const changeProductStatus = async (
    id,
    currentStatus
  ) => {

    const newStatus =
      currentStatus === "PASIF"
        ? "AKTIF"
        : "PASIF";

    try {

      const response = await fetch(
        `https://pastaflow.onrender.com/products/${id}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (data.success) {

        alert(data.message);

        loadProducts();

      } else {

        alert(
          data.message ||
          "❌ İşlem başarısız."
        );

      }

    } catch (error) {

      console.error(error);

      alert(
        "❌ Sunucuya bağlanılamadı."
      );

    }
  };

  // =========================
  // GÖRÜNTÜLENECEK ÜRÜNLER
  // =========================

  const visibleProducts =
    products.filter((product) => {

      // PERSONEL SADECE KENDİ ŞUBESİNİ GÖRÜR
      if (
        !isManager &&
        product.branch !== userBranch
      ) {
        return false;
      }

      const nameMatch =
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const branchMatch =
        branchFilter === ""
          ? true
          : product.branch === branchFilter;

      const categoryMatch =
        categoryFilter === ""
          ? true
          : product.category ===
            categoryFilter;

      const criticalMatch =
        criticalOnly
          ? product.stock <=
            product.critical
          : true;

      const statusMatch =
        showInactive
          ? true
          : product.status !== "PASIF";

      return (
        nameMatch &&
        branchMatch &&
        categoryMatch &&
        criticalMatch &&
        statusMatch
      );
    });

  // =========================
  // AKTİF ŞUBELER
  // =========================

  const visibleBranches =
    branches.filter(
      (b) => {

        if (b.status !== "AKTIF") {
          return false;
        }

        // YÖNETİCİ TÜM ŞUBELERİ GÖRÜR
        if (isManager) {
          return true;
        }

        // PERSONEL SADECE KENDİ ŞUBESİNİ GÖRÜR
        return b.name === userBranch;
      }
    );

  // =========================
  // EKRAN
  // =========================

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1100px",
      }}
    >

      <h1>
        📦 Ürün Yönetimi
      </h1>

      <p
        style={{
          color: "#6b7280",
          marginBottom: "25px",
        }}
      >
        {isManager
          ? "Tüm şubelerdeki ürünleri yönetebilirsiniz."
          : `${userBranch} şubesindeki ürünleri yönetiyorsunuz.`}
      </p>

      {/* =========================
          FİLTRELER
      ========================= */}

      <input
        type="text"
        placeholder="🔍 Ürün Ara..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border:
            "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      {/* ŞUBE FİLTRESİ */}

      {isManager ? (

        <select
          value={branchFilter}
          onChange={(e) =>
            setBranchFilter(
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
            🏪 Tüm Şubeler
          </option>

          {visibleBranches.map(
            (b) => (
              <option
                key={b.id}
                value={b.name}
              >
                {b.name}
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
            padding: "12px",
            borderRadius: "7px",
            marginBottom: "15px",
            fontWeight: "bold",
            color: "#1e40af",
          }}
        >
          🏪 Şubeniz: {userBranch}
        </div>

      )}

      {/* KATEGORİ */}

      <select
        value={categoryFilter}
        onChange={(e) =>
          setCategoryFilter(
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
          📂 Tüm Kategoriler
        </option>

        {[
          ...new Set(
            visibleProducts.map(
              (p) => p.category
            )
          ),
        ].map((category) => (

          <option
            key={category}
            value={category}
          >
            {category}
          </option>

        ))}

      </select>

      {/* KRİTİK */}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "15px",
          fontWeight: "bold",
        }}
      >

        <input
          type="checkbox"
          checked={criticalOnly}
          onChange={(e) =>
            setCriticalOnly(
              e.target.checked
            )
          }
        />

        ⚠️ Sadece Kritik Ürünleri Göster

      </label>

      {/* PASİF */}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >

        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) =>
            setShowInactive(
              e.target.checked
            )
          }
        />

        ⚪ Pasif Ürünleri Göster

      </label>

      {/* =========================
          ÜRÜN EKLEME
      ========================= */}

      <div
        style={{
          background: "#f9fafb",
          padding: "20px",
          borderRadius: "10px",
          border:
            "1px solid #e5e7eb",
        }}
      >

        <h2>
          ➕ Yeni Ürün
        </h2>

        <input
          type="text"
          placeholder="Ürün Adı"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Kategori"
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
          style={inputStyle}
        />

        {/* YÖNETİCİ ŞUBE SEÇER */}

        {isManager ? (

          <select
            value={branch}
            onChange={(e) =>
              setBranch(
                e.target.value
              )
            }
            style={inputStyle}
          >

            <option value="">
              Şube Seçiniz
            </option>

            {visibleBranches.map(
              (b) => (

                <option
                  key={b.id}
                  value={b.name}
                >
                  {b.name}
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
              marginBottom: "10px",
              color: "#1e40af",
              fontWeight: "bold",
            }}
          >
            🏪 Şube: {userBranch}
          </div>

        )}

        <input
          type="number"
          placeholder="Stok"
          value={stock}
          onChange={(e) =>
            setStock(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Kritik Stok"
          value={critical}
          onChange={(e) =>
            setCritical(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <button
          onClick={saveProduct}
          style={{
            padding:
              "12px 20px",
            background:
              "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {editingId
            ? "💾 Güncelle"
            : "➕ Ürünü Kaydet"}
        </button>

      </div>

      <hr
        style={{
          margin: "40px 0",
        }}
      />

      {/* =========================
          ÜRÜNLER
      ========================= */}

      <h2>
        📦 Ürünler
      </h2>

      <p
        style={{
          color: "#6b7280",
        }}
      >
        Gösterilen ürün sayısı:{" "}
        <strong>
          {visibleProducts.length}
        </strong>
      </p>

      <div
        style={{
          overflowX: "auto",
        }}
      >

        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            marginTop: "20px",
          }}
        >

          <thead>

            <tr
              style={{
                background:
                  "#f3f4f6",
              }}
            >

              <th style={thStyle}>
                Ürün
              </th>

              <th style={thStyle}>
                Kategori
              </th>

              <th style={thStyle}>
                Şube
              </th>
<th style={thStyle}>
  Birim
</th>
              <th style={thStyle}>
                Stok
              </th>

              <th style={thStyle}>
                Kritik
              </th>

              <th style={thStyle}>
                Durum
              </th>

              <th style={thStyle}>
                İşlem
              </th>

            </tr>

          </thead>

          <tbody>

            {visibleProducts.map(
              (product) => (

                <tr
                  key={product.id}
                >

                  <td style={tdStyle}>
                    {product.name}
                  </td>

                  <td style={tdStyle}>
                    {product.category}
                  </td>

                  <td style={tdStyle}>
                    {product.branch}
                  </td>
<td style={tdStyle}>
  {product.unit || "ADET"}
</td>
                  <td style={tdStyle}>
  {product.stock} {product.unit || "ADET"}
</td>

                  <td style={tdStyle}>
                    {product.critical}
                  </td>

                  <td style={tdStyle}>

                    {product.status ===
                    "PASIF" ? (
                      <span
                        style={{
                          color:
                            "#dc2626",
                          fontWeight:
                            "bold",
                        }}
                      >
                        🔴 PASİF
                      </span>
                    ) : product.stock ===
                      0 ? (
                      <span
                        style={{
                          color:
                            "#dc2626",
                          fontWeight:
                            "bold",
                        }}
                      >
                        🔴 STOK YOK
                      </span>
                    ) : product.stock <=
                      product.critical ? (
                      <span
                        style={{
                          color:
                            "#ea580c",
                          fontWeight:
                            "bold",
                        }}
                      >
                        🟠 KRİTİK
                      </span>
                    ) : (
                      <span
                        style={{
                          color:
                            "#16a34a",
                          fontWeight:
                            "bold",
                        }}
                      >
                        🟢 NORMAL
                      </span>
                    )}

                  </td>

                  <td
                    style={tdStyle}
                  >

                    <td style={tdStyle}>

  {isManager && (
    <>
      <button
        onClick={() => {

          setEditingId(product.id);

          setName(product.name);

          setCategory(product.category);
setUnit(product.unit || "ADET");
          setBranch(product.branch);


          setStock(product.stock);

          setCritical(product.critical);

        }}
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "6px",
        }}
      >
        ✏️ Düzenle
      </button>

      <button
        onClick={() =>
          changeProductStatus(
            product.id,
            product.status
          )
        }
        style={{
          background:
            product.status === "PASIF"
              ? "#16a34a"
              : "#dc2626",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {product.status === "PASIF"
          ? "🟢 Aktifleştir"
          : "🔴 Pasife Al"}
      </button>
    </>
  )}

  {!isManager && (
    <span
      style={{
        color: "#6b7280",
        fontWeight: "bold",
      }}
    >
      🔒 Yetki yok
    </span>
  )}

</td>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

// =========================
// STİLLER
// =========================

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  border:
    "1px solid #d1d5db",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const thStyle = {
  padding: "12px",
  border:
    "1px solid #ddd",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  border:
    "1px solid #ddd",
};

export default ProductManagement;