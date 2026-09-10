import { useEffect, useState } from "react";
import {
  getProducts,
  deleteProduct as deleteProductService,
} from "../services/productService";
import EditProductModal from "../components/EditProductModal";

function Stock() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isEditing, setIsEditing] = useState(false);

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
  // ÜRÜNLERİ YÜKLE
  // =========================

  useEffect(() => {
    loadProducts();
  }, []);

const loadProducts = async () => {
  try {
    // ÜRÜNLERİ YÜKLE
    const data = await getProducts();
    setProducts(data);

    // ŞUBELERİ YÜKLE
    const branchesResponse = await fetch(
      "http://127.0.0.1:3001/branches"
    );

    const branchesData =
      await branchesResponse.json();

    // SADECE AKTİF ŞUBELER
    setBranches(
      branchesData.filter(
        (branch) =>
          branch.status === "AKTIF"
      )
    );

  } catch (error) {
    console.error(
      "Veriler yüklenemedi:",
      error
    );
  }
};

  // =========================
  // SIRALAMA
  // =========================

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(
        sortOrder === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // =========================
  // ÜRÜN SİL
  // =========================

  const deleteProduct = async (product) => {

    // PERSONEL KENDİ ŞUBESİ DIŞINDA İŞLEM YAPAMAZ
    if (
      !isManager &&
      product.branch !== userBranch
    ) {
      alert(
        "❌ Bu ürün üzerinde işlem yapma yetkiniz yok."
      );
      return;
    }

    const cevap = window.confirm(
      `"${product.name}" ürününü silmek istediğinize emin misiniz?`
    );

    if (!cevap) return;

    try {
      const data =
        await deleteProductService(
          product.id
        );

      if (data.success) {
        alert("✅ Ürün silindi.");
        loadProducts();
      } else {
        alert(
          data.message ||
            "❌ Ürün silinemedi."
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "❌ Ürün silinirken hata oluştu."
      );
    }
  };

  // =========================
  // GÖRÜNÜR ÜRÜNLER
  // =========================

  const visibleProducts =
    products.filter((product) => {

      // YÖNETİCİ
      // Şube filtresi seçilmişse ona göre filtrele
      if (isManager) {

        if (
          selectedBranch !== "" &&
          product.branch !== selectedBranch
        ) {
          return false;
        }

        return true;
      }

      // PERSONEL
      // SADECE KENDİ ŞUBESİ
      return (
        product.branch === userBranch
      );
    });

  // =========================
  // ARAMA + SIRALAMA
  // =========================

  const filteredProducts =
    [...visibleProducts]
      .filter((product) =>
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )
      .sort((a, b) => {

        if (!sortField) return 0;

        if (
          a[sortField] <
          b[sortField]
        ) {
          return sortOrder === "asc"
            ? -1
            : 1;
        }

        if (
          a[sortField] >
          b[sortField]
        ) {
          return sortOrder === "asc"
            ? 1
            : -1;
        }

        return 0;
      });

  return (
    <div style={{ padding: "30px" }}>

      <h1>
        📦 Stok Takibi
      </h1>

      {/* =========================
          KULLANICI / ŞUBE BİLGİSİ
      ========================= */}

      {!isManager && (
        <div
          style={{
            background: "#f3f4f6",
            border: "1px solid #d1d5db",
            padding: "12px 15px",
            borderRadius: "8px",
            marginTop: "15px",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          👤 {currentUser?.name || "Personel"}
          {" | "}
          🏪 Aktif Şube: {userBranch}
        </div>
      )}

      {isManager && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #93c5fd",
            padding: "12px 15px",
            borderRadius: "8px",
            marginTop: "15px",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          👑 Yönetici
          {" | "}
          Tüm şubeleri görüntüleyebilirsiniz.
        </div>
      )}

      {/* =========================
          ARAMA
      ========================= */}

      <input
        type="text"
        placeholder="🔍 Ürün Ara..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: "300px",
          padding: "10px",
          marginTop: "10px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {/* =========================
          ŞUBE FİLTRESİ
      ========================= */}

      {isManager ? (
        <select
  value={selectedBranch}
  onChange={(e) =>
    setSelectedBranch(e.target.value)
  }
  style={{
    width: "200px",
    padding: "10px",
    marginLeft: "15px",
    marginBottom: "20px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
>
  <option value="">
    Tüm Şubeler
  </option>

  {branches.map((branch) => (
    <option
      key={branch.id}
      value={branch.name}
    >
      {branch.name}
    </option>
  ))}
</select>
      ) : (
        <div
          style={{
            display: "inline-block",
            padding: "10px 15px",
            marginLeft: "15px",
            marginBottom: "20px",
            background: "#f9fafb",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          🏪 {userBranch}
        </div>
      )}

      {/* =========================
          ÜRÜN SAYISI
      ========================= */}

      <div
        style={{
          marginBottom: "15px",
          fontWeight: "bold",
        }}
      >
        📦 Görüntülenen Ürün:
        {" "}
        {filteredProducts.length}
      </div>

      {/* =========================
          TABLO
      ========================= */}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "25px",
        }}
      >

        <thead>
          <tr
            style={{
              background: "#2563eb",
              color: "white",
            }}
          >

            <th
              style={{
                ...cellStyle,
                cursor: "pointer",
              }}
              onClick={() =>
                handleSort("name")
              }
            >
              Ürün ↕
            </th>

            <th style={cellStyle}>
              Kategori
            </th>

            <th style={cellStyle}>
              Şube
            </th>

            <th
              style={{
                ...cellStyle,
                cursor: "pointer",
              }}
              onClick={() =>
                handleSort("stock")
              }
            >
              Mevcut ↕
            </th>

            <th
              style={{
                ...cellStyle,
                cursor: "pointer",
              }}
              onClick={() =>
                handleSort("critical")
              }
            >
              Kritik ↕
            </th>

            <th style={cellStyle}>
              Durum
            </th>

            <th style={cellStyle}>
              İşlem
            </th>

          </tr>
        </thead>

        <tbody>

          {filteredProducts.map(
            (product) => (

              <tr
                key={product.id}
              >

                <td style={cellStyle}>
                  {product.name}
                </td>

                <td style={cellStyle}>
                  {product.category}
                </td>

                <td style={cellStyle}>
                  {product.branch}
                </td>

                <td style={cellStyle}>
                  {product.stock}
                </td>

                <td style={cellStyle}>
                  {product.critical}
                </td>

                <td style={cellStyle}>

                  {product.stock <=
                  product.critical
                    ? "🔴 Kritik"
                    : "🟢 Normal"}

                </td>

                <td style={cellStyle}>

  {isManager ? (

    <>
      {/* DÜZENLE */}

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

      {/* SİL */}

      <button
        onClick={() =>
          deleteProduct(product)
        }
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
    </>

  ) : (

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
              </tr>
            )
          )}

        </tbody>

      </table>

      {/* =========================
          ÜRÜN YOKSA
      ========================= */}

      {filteredProducts.length ===
        0 && (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          📦 Bu şubede görüntülenecek
          ürün bulunmuyor.
        </div>
      )}

      {/* =========================
          DÜZENLEME MODALI
      ========================= */}

      {isEditing && (
        <EditProductModal
          product={selectedProduct}

          onClose={() =>
            setIsEditing(false)
          }

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