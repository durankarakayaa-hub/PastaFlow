import { useEffect, useState } from "react";

function Settings() {

  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);

  const [activeTab, setActiveTab] = useState("products");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // =========================
  // ÜRÜN FORMU
  // =========================

  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productBranch, setProductBranch] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productCritical, setProductCritical] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);

  // =========================
  // ŞUBE FORMU
  // =========================

  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");

  const [editingBranch, setEditingBranch] = useState(null);

  // =========================
  // KULLANICI FORMU
  // =========================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState("");
  const [userBranch, setUserBranch] = useState("");

  const [editingUser, setEditingUser] = useState(null);

  // =========================
  // İLK YÜKLEME
  // =========================

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // MESAJ
  // =========================

  const showMessage = (text, error = false) => {

    setMessage(text);
    setIsError(error);

    setTimeout(() => {
      setMessage("");
    }, 3000);

  };

  // =========================
  // VERİLERİ YÜKLE
  // =========================

  const loadData = async () => {

    try {

      const [
        productsResponse,
        branchesResponse,
        usersResponse
      ] = await Promise.all([
        fetch("http://localhost:3001/products"),
        fetch("http://localhost:3001/branches"),
        fetch("http://localhost:3001/users"),
      ]);

      const productsData = await productsResponse.json();
      const branchesData = await branchesResponse.json();
      const usersData = await usersResponse.json();

      setProducts(productsData);
      setBranches(branchesData);
      setUsers(usersData);

    } catch (error) {

      console.error(error);
      showMessage("Veriler yüklenemedi.", true);

    }

  };

  // =========================================================
  // ÜRÜN EKLE
  // =========================================================

  const addProduct = async () => {

    if (!productName || !productCategory || !productBranch) {

      showMessage(
        "Ürün adı, kategori ve şube zorunludur.",
        true
      );

      return;

    }

    const response = await fetch(
      "http://localhost:3001/products",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: productName,
          category: productCategory,
          branch: productBranch,
          stock: Number(productStock) || 0,
          critical: Number(productCritical) || 0,
        }),

      }
    );

    const data = await response.json();

    if (response.ok && data.success) {

      showMessage("✅ Ürün başarıyla eklendi.");

      setProductName("");
      setProductCategory("");
      setProductBranch("");
      setProductStock("");
      setProductCritical("");

      loadData();

    } else {

      showMessage(
        data.message || "Ürün eklenemedi.",
        true
      );

    }

  };

  // =========================================================
  // ÜRÜN DÜZENLE
  // =========================================================

  const updateProduct = async () => {

    if (
      !editingProduct.name ||
      !editingProduct.category ||
      !editingProduct.branch
    ) {

      showMessage(
        "Ürün adı, kategori ve şube zorunludur.",
        true
      );

      return;

    }

    const response = await fetch(
      `http://localhost:3001/products/${editingProduct.id}`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          name: editingProduct.name,
          category: editingProduct.category,
          branch: editingProduct.branch,
          stock: Number(editingProduct.stock) || 0,
          critical: Number(editingProduct.critical) || 0,

        }),

      }
    );

    const data = await response.json();

    if (response.ok && data.success) {

      showMessage("✅ Ürün başarıyla güncellendi.");

      setEditingProduct(null);

      loadData();

    } else {

      showMessage(
        data.message || "Ürün güncellenemedi.",
        true
      );

    }

  };

  // =========================================================
  // ÜRÜN AKTİF / PASİF
  // =========================================================

  const toggleProductStatus = async (product) => {

    const newStatus =
      product.status === "AKTIF"
        ? "PASIF"
        : "AKTIF";

    const response = await fetch(
      `http://localhost:3001/products/${product.id}/status`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: newStatus,
        }),

      }
    );

    const data = await response.json();

    if (response.ok && data.success) {

      showMessage(data.message);
      loadData();

    } else {

      showMessage(
        data.message || "Durum değiştirilemedi.",
        true
      );

    }

  };

  // =========================================================
  // ŞUBE EKLE
  // =========================================================

  const addBranch = async () => {

    if (!branchCode || !branchName) {

      showMessage(
        "Şube kodu ve şube adı zorunludur.",
        true
      );

      return;

    }

    const response = await fetch(
      "http://localhost:3001/branches",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          code: branchCode,
          name: branchName,
        }),

      }
    );

    const data = await response.json();

    if (response.ok && data.success) {

      showMessage("✅ Şube başarıyla eklendi.");

      setBranchCode("");
      setBranchName("");

      loadData();

    } else {

      showMessage(
        data.message || "Şube eklenemedi.",
        true
      );

    }

  };

  // =========================================================
  // ŞUBE DÜZENLE
  // =========================================================

  const updateBranch = async () => {

    if (!editingBranch.code || !editingBranch.name) {

      showMessage(
        "Şube kodu ve şube adı zorunludur.",
        true
      );

      return;

    }

    const response = await fetch(
      `http://localhost:3001/branches/${editingBranch.id}`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          code: editingBranch.code,
          name: editingBranch.name,
        }),

      }
    );

    const data = await response.json();

    if (response.ok && data.success) {

      showMessage("✅ Şube başarıyla güncellendi.");

      setEditingBranch(null);

      loadData();

    } else {

      showMessage(
        data.message || "Şube güncellenemedi.",
        true
      );

    }

  };

  // =========================================================
  // ŞUBE AKTİF / PASİF
  // =========================================================

  const toggleBranchStatus = async (branch) => {

    const response = await fetch(
      `http://localhost:3001/branches/${branch.id}/status`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {

      showMessage(data.message);

      loadData();

    } else {

      showMessage(
        data.message || "Şube durumu değiştirilemedi.",
        true
      );

    }

  };

  // =========================================================
  // KULLANICI EKLE
  // =========================================================

  const addUser = async () => {

    if (
      !username ||
      !password ||
      !fullname ||
      !role
    ) {

      showMessage(
        "Ad soyad, kullanıcı adı, şifre ve rol zorunludur.",
        true
      );

      return;

    }

    const response = await fetch(
      "http://localhost:3001/users",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          username,
          password,
          fullname,
          role,
          branch: userBranch,

        }),

      }
    );

    const data = await response.json();

    if (response.ok && data.success) {

      showMessage("✅ Kullanıcı başarıyla eklendi.");

      setUsername("");
      setPassword("");
      setFullname("");
      setRole("");
      setUserBranch("");

      loadData();

    } else {

      showMessage(
        data.message || "Kullanıcı eklenemedi.",
        true
      );

    }

  };

  // =========================================================
  // KULLANICI DÜZENLE
  // =========================================================

  const updateUser = async () => {

    if (
      !editingUser.username ||
      !editingUser.fullname ||
      !editingUser.role
    ) {

      showMessage(
        "Ad soyad, kullanıcı adı ve rol zorunludur.",
        true
      );

      return;

    }

    const response = await fetch(
      `http://localhost:3001/users/${editingUser.id}`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          username: editingUser.username,
          password: editingUser.password,
          fullname: editingUser.fullname,
          role: editingUser.role,
          branch: editingUser.branch,

        }),

      }
    );

    const data = await response.json();

    if (response.ok && data.success) {

      showMessage("✅ Kullanıcı başarıyla güncellendi.");

      setEditingUser(null);

      loadData();

    } else {

      showMessage(
        data.message || "Kullanıcı güncellenemedi.",
        true
      );

    }

  };

  // =========================================================
  // KULLANICI AKTİF / PASİF
  // =========================================================

  const toggleUserStatus = async (user) => {

    const response = await fetch(
      `http://localhost:3001/users/${user.id}/status`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {

      showMessage(data.message);

      loadData();

    } else {

      showMessage(
        data.message || "Kullanıcı durumu değiştirilemedi.",
        true
      );

    }

  };

  return (

    <div
      style={{
        padding: "30px",
        maxWidth: "1100px",
      }}
    >

      <h1>⚙️ Ayarlar</h1>

      <p style={{ color: "#6b7280" }}>
        Ürün, şube ve kullanıcı yönetimini buradan gerçekleştirebilirsiniz.
      </p>

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
            marginTop: "20px",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>

      )}

      {/* =====================================================
          SEKME BUTONLARI
      ===================================================== */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "25px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >

        <button
          onClick={() => setActiveTab("products")}
          style={tabStyle(activeTab === "products")}
        >
          📦 Ürün Yönetimi
        </button>

        <button
          onClick={() => setActiveTab("branches")}
          style={tabStyle(activeTab === "branches")}
        >
          🏪 Şube Yönetimi
        </button>

        <button
          onClick={() => setActiveTab("users")}
          style={tabStyle(activeTab === "users")}
        >
          👤 Kullanıcı Yönetimi
        </button>

      </div>

      {/* =====================================================
          ÜRÜN YÖNETİMİ
      ===================================================== */}

      {activeTab === "products" && (

        <div>

          <div style={formBoxStyle}>

            <h2>➕ Yeni Ürün Ekle</h2>

            <input
              placeholder="Ürün adı"
              value={productName}
              onChange={(e) =>
                setProductName(e.target.value)
              }
              style={inputStyle}
            />

            <input
              placeholder="Kategori"
              value={productCategory}
              onChange={(e) =>
                setProductCategory(e.target.value)
              }
              style={inputStyle}
            />

            <select
              value={productBranch}
              onChange={(e) =>
                setProductBranch(e.target.value)
              }
              style={inputStyle}
            >

              <option value="">
                Şube seçiniz
              </option>

              {branches
                .filter(
                  (branch) =>
                    branch.status === "AKTIF"
                )
                .map((branch) => (

                  <option
                    key={branch.id}
                    value={branch.name}
                  >
                    {branch.name}
                  </option>

                ))}

            </select>

            <input
              type="number"
              placeholder="Başlangıç stoğu"
              value={productStock}
              onChange={(e) =>
                setProductStock(e.target.value)
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Kritik stok seviyesi"
              value={productCritical}
              onChange={(e) =>
                setProductCritical(e.target.value)
              }
              style={inputStyle}
            />

            <button
              onClick={addProduct}
              style={greenButton}
            >
              ➕ Ürün Ekle
            </button>

          </div>

          <h2>📦 Ürünler</h2>

          <div style={{ overflowX: "auto" }}>

            <table style={tableStyle}>

              <thead>

                <tr>

                  <th style={thStyle}>Ürün</th>
                  <th style={thStyle}>Kategori</th>
                  <th style={thStyle}>Şube</th>
                  <th style={thStyle}>Stok</th>
                  <th style={thStyle}>Kritik</th>
                  <th style={thStyle}>Durum</th>
                  <th style={thStyle}>İşlem</th>

                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

                  <tr key={product.id}>

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
                      {product.stock}
                    </td>

                    <td style={tdStyle}>
                      {product.critical}
                    </td>

                    <td style={tdStyle}>

                      <strong
                        style={{
                          color:
                            product.status === "AKTIF"
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {product.status === "AKTIF"
                          ? "🟢 AKTİF"
                          : "🔴 PASİF"}
                      </strong>

                    </td>

                    <td style={tdStyle}>

                      <button
                        onClick={() =>
                          setEditingProduct(product)
                        }
                        style={smallBlueButton}
                      >
                        ✏️ Düzenle
                      </button>

                      <button
                        onClick={() =>
                          toggleProductStatus(product)
                        }
                        style={
                          product.status === "AKTIF"
                            ? smallRedButton
                            : smallGreenButton
                        }
                      >
                        {product.status === "AKTIF"
                          ? "🔴 Pasif"
                          : "🟢 Aktif"}
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {editingProduct && (

            <div style={modalStyle}>

              <h2>✏️ Ürün Düzenle</h2>

              <input
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    name: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <input
                value={editingProduct.category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <select
                value={editingProduct.branch}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    branch: e.target.value,
                  })
                }
                style={inputStyle}
              >

                {branches.map((branch) => (

                  <option
                    key={branch.id}
                    value={branch.name}
                  >
                    {branch.name}
                  </option>

                ))}

              </select>

              <input
                type="number"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stock: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <input
                type="number"
                value={editingProduct.critical}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    critical: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <button
                onClick={updateProduct}
                style={greenButton}
              >
                💾 Kaydet
              </button>

              <button
                onClick={() =>
                  setEditingProduct(null)
                }
                style={grayButton}
              >
                İptal
              </button>

            </div>

          )}

        </div>

      )}

      {/* =====================================================
          ŞUBE YÖNETİMİ
      ===================================================== */}

      {activeTab === "branches" && (

        <div>

          <div style={formBoxStyle}>

            <h2>➕ Yeni Şube Ekle</h2>

            <input
              placeholder="Şube kodu"
              value={branchCode}
              onChange={(e) =>
                setBranchCode(e.target.value)
              }
              style={inputStyle}
            />

            <input
              placeholder="Şube adı"
              value={branchName}
              onChange={(e) =>
                setBranchName(e.target.value)
              }
              style={inputStyle}
            />

            <button
              onClick={addBranch}
              style={greenButton}
            >
              ➕ Şube Ekle
            </button>

          </div>

          <h2>🏪 Şubeler</h2>

          <div style={{ overflowX: "auto" }}>

            <table style={tableStyle}>

              <thead>

                <tr>

                  <th style={thStyle}>Kod</th>
                  <th style={thStyle}>Şube</th>
                  <th style={thStyle}>Durum</th>
                  <th style={thStyle}>İşlem</th>

                </tr>

              </thead>

              <tbody>

                {branches.map((branch) => (

                  <tr key={branch.id}>

                    <td style={tdStyle}>
                      {branch.code}
                    </td>

                    <td style={tdStyle}>
                      {branch.name}
                    </td>

                    <td style={tdStyle}>

                      <strong
                        style={{
                          color:
                            branch.status === "AKTIF"
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {branch.status === "AKTIF"
                          ? "🟢 AKTİF"
                          : "🔴 PASİF"}
                      </strong>

                    </td>

                    <td style={tdStyle}>

                      <button
                        onClick={() =>
                          setEditingBranch(branch)
                        }
                        style={smallBlueButton}
                      >
                        ✏️ Düzenle
                      </button>

                      <button
                        onClick={() =>
                          toggleBranchStatus(branch)
                        }
                        style={
                          branch.status === "AKTIF"
                            ? smallRedButton
                            : smallGreenButton
                        }
                      >
                        {branch.status === "AKTIF"
                          ? "🔴 Pasif"
                          : "🟢 Aktif"}
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {editingBranch && (

            <div style={modalStyle}>

              <h2>✏️ Şube Düzenle</h2>

              <input
                value={editingBranch.code}
                onChange={(e) =>
                  setEditingBranch({
                    ...editingBranch,
                    code: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <input
                value={editingBranch.name}
                onChange={(e) =>
                  setEditingBranch({
                    ...editingBranch,
                    name: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <button
                onClick={updateBranch}
                style={greenButton}
              >
                💾 Kaydet
              </button>

              <button
                onClick={() =>
                  setEditingBranch(null)
                }
                style={grayButton}
              >
                İptal
              </button>

            </div>

          )}

        </div>

      )}

      {/* =====================================================
          KULLANICI YÖNETİMİ
      ===================================================== */}

      {activeTab === "users" && (

        <div>

          <div style={formBoxStyle}>

            <h2>👤 Yeni Kullanıcı Ekle</h2>

            <input
              placeholder="Ad Soyad"
              value={fullname}
              onChange={(e) =>
                setFullname(e.target.value)
              }
              style={inputStyle}
            />

            <input
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={inputStyle}
            />

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              style={inputStyle}
            >

              <option value="">
                Rol seçiniz
              </option>

              <option value="ADMIN">
                Yönetici
              </option>

              <option value="MUDUR">
                Müdür
              </option>

              <option value="PERSONEL">
                Personel
              </option>

            </select>

            <select
              value={userBranch}
              onChange={(e) =>
                setUserBranch(e.target.value)
              }
              style={inputStyle}
            >

              <option value="">
                Şube seçiniz
              </option>

              {branches
                .filter(
                  (branch) =>
                    branch.status === "AKTIF"
                )
                .map((branch) => (

                  <option
                    key={branch.id}
                    value={branch.name}
                  >
                    {branch.name}
                  </option>

                ))}

            </select>

            <button
              onClick={addUser}
              style={greenButton}
            >
              👤 Kullanıcı Ekle
            </button>

          </div>

          <h2>👥 Kullanıcılar</h2>

          <div style={{ overflowX: "auto" }}>

            <table style={tableStyle}>

              <thead>

                <tr>

                  <th style={thStyle}>
                    Ad Soyad
                  </th>

                  <th style={thStyle}>
                    Kullanıcı
                  </th>

                  <th style={thStyle}>
                    Rol
                  </th>

                  <th style={thStyle}>
                    Şube
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

                {users.map((user) => (

                  <tr key={user.id}>

                    <td style={tdStyle}>
                      {user.fullname}
                    </td>

                    <td style={tdStyle}>
                      {user.username}
                    </td>

                    <td style={tdStyle}>
                      {user.role}
                    </td>

                    <td style={tdStyle}>
                      {user.branch || "Tüm Şubeler"}
                    </td>

                    <td style={tdStyle}>

                      <strong
                        style={{
                          color:
                            user.status === "AKTIF"
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {user.status === "AKTIF"
                          ? "🟢 AKTİF"
                          : "🔴 PASİF"}
                      </strong>

                    </td>

                    <td style={tdStyle}>

                      <button
                        onClick={() =>
                          setEditingUser({
                            ...user,
                            password: user.password || "",
                          })
                        }
                        style={smallBlueButton}
                      >
                        ✏️ Düzenle
                      </button>

                      <button
                        onClick={() =>
                          toggleUserStatus(user)
                        }
                        style={
                          user.status === "AKTIF"
                            ? smallRedButton
                            : smallGreenButton
                        }
                      >
                        {user.status === "AKTIF"
                          ? "🔴 Pasif"
                          : "🟢 Aktif"}
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {editingUser && (

            <div style={modalStyle}>

              <h2>✏️ Kullanıcı Düzenle</h2>

              <input
                placeholder="Ad Soyad"
                value={editingUser.fullname}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    fullname: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <input
                placeholder="Kullanıcı adı"
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    username: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Şifre"
                value={editingUser.password || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    password: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value,
                  })
                }
                style={inputStyle}
              >

                <option value="ADMIN">
                  Yönetici
                </option>

                <option value="MUDUR">
                  Müdür
                </option>

                <option value="PERSONEL">
                  Personel
                </option>

              </select>

              <select
                value={editingUser.branch || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    branch: e.target.value,
                  })
                }
                style={inputStyle}
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

              <button
                onClick={updateUser}
                style={greenButton}
              >
                💾 Kaydet
              </button>

              <button
                onClick={() =>
                  setEditingUser(null)
                }
                style={grayButton}
              >
                İptal
              </button>

            </div>

          )}

        </div>

      )}

    </div>

  );

}

// =========================================================
// STİLLER
// =========================================================

const tabStyle = (active) => ({
  padding: "12px 20px",
  border: "none",
  borderRadius: "7px",
  background: active ? "#2563eb" : "#e5e7eb",
  color: active ? "white" : "#111827",
  cursor: "pointer",
  fontWeight: "bold",
});

const formBoxStyle = {
  background: "#f9fafb",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "25px",
  border: "1px solid #e5e7eb",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const greenButton = {
  padding: "10px 18px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

const grayButton = {
  padding: "10px 18px",
  marginLeft: "10px",
  background: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const smallBlueButton = {
  padding: "7px 10px",
  marginRight: "5px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const smallRedButton = {
  padding: "7px 10px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const smallGreenButton = {
  padding: "7px 10px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
};

const thStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  background: "#f3f4f6",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd",
};

const modalStyle = {
  marginTop: "25px",
  padding: "20px",
  background: "#eff6ff",
  border: "1px solid #93c5fd",
  borderRadius: "10px",
};

export default Settings;