import { getProducts } from "../services/productService";
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import Sidebar from "../components/Sidebar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {

  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [branches, setBranches] = useState([]);

  // =========================
  // GİRİŞ YAPAN KULLANICI
  // =========================

  const currentUser = JSON.parse(
    localStorage.getItem("pastaflow_user") || "null"
  );

  const isManager =
    currentUser?.role === "YONETICI";

  const userName =
    currentUser?.name ||
    currentUser?.fullname ||
    currentUser?.username ||
    "Kullanıcı";

  const userBranch =
    currentUser?.branch || "";
console.log("===== YETKİ TESTİ =====");
console.log("Kullanıcı:", currentUser);
console.log("Kullanıcı rolü:", currentUser?.role);
console.log("isManager:", isManager);
console.log("Kullanıcı şubesi:", userBranch);
  // =========================
  // VERİLERİ YÜKLE
  // =========================

 const refreshDashboard = async () => {
  try {
    const token = localStorage.getItem("pastaflow_token");

    // ÜRÜNLER
    const productsData = await getProducts();

    // HAREKETLER
    const movementResponse = await fetch(
      "http://127.0.0.1:3001/stock-movements",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const movementData = await movementResponse.json();

    // ŞUBELER
    const branchesResponse = await fetch(
      "http://127.0.0.1:3001/branches"
    );

    const branchesData = await branchesResponse.json();

    setProducts(productsData);

    if (movementData.success) {
      setMovements(movementData.movements);
    } else {
      setMovements([]);
      console.error(
        "Hareketler alınamadı:",
        movementData.message
      );
    }

    setBranches(
      branchesData.filter(
        (branch) => branch.status === "AKTIF"
      )
    );

  } catch (err) {
    console.log(
      "Dashboard verileri yüklenemedi:",
      err
    );
  }
};

  useEffect(() => {

    refreshDashboard();

  }, []);

  // =========================
  // SAAT
  // =========================

  useEffect(() => {

    const timer =
      setInterval(() => {

        setCurrentTime(
          new Date()
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  // =========================
  // ŞUBEYE GÖRE ÜRÜNLER
  // =========================

 const normalizeBranch = (value) => {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR");
};

const visibleProducts =
  products.filter((product) => {

    // YÖNETİCİ TÜM ŞUBELERİ GÖRÜR
    if (isManager) {
      return true;
    }

    // PERSONEL SADECE KENDİ ŞUBESİNİ GÖRÜR
    return (
      normalizeBranch(product.branch) ===
      normalizeBranch(userBranch)
    );

  });
  console.log("===== STOK KAPSAM TESTİ =====");
console.log("isManager:", isManager);
console.log("userBranch:", userBranch);
console.log("Toplam products:", products.length);
console.log("visibleProducts:", visibleProducts.length);

console.log(
  "Görünen şubeler:",
  [...new Set(
    visibleProducts.map((p) => p.branch)
  )]
);
  useEffect(() => {
  if (products.length > 0) {
    console.log("===== ŞUBE TESTİ =====");
    console.log("Kullanıcı:", currentUser);
    console.log("Kullanıcı Şubesi:", userBranch);

    products.forEach((product) => {
      console.log(
        product.name,
        "| Ürün Şubesi:",
        product.branch,
        "| Eşleşme:",
        normalizeBranch(product.branch) ===
          normalizeBranch(userBranch)
      );
    });
    console.log(
  "🔎 GÖRÜNÜR ÜRÜNLER:",
  visibleProducts.map((p) => ({
    ürün: p.name,
    şube: p.branch,
    durum: p.status,
    stok: p.stock,
  }))
);
  }
}, [products, userBranch]);

  // =========================
  // AKTİF ÜRÜNLER
  // =========================

  const activeProducts =
    visibleProducts.filter(
      (p) =>
        p.status === "AKTIF"
    );
console.log(
  "Aktif ürün sayısı:",
  activeProducts.length
);

console.log(
  "Aktif ürün şubeleri:",
  [...new Set(
    activeProducts.map((p) => p.branch)
  )]
);

console.log(
  "Aktif ADET stok:",
  activeProducts
    .filter(
      (p) =>
        String(p.unit || "")
          .trim()
          .toUpperCase() === "ADET"
    )
    .reduce(
      (sum, p) =>
        sum + Number(p.stock || 0),
      0
    )
);
  // =========================
  // HAREKETLER
  // =========================

  const visibleMovements =
    movements.filter((movement) => {

      // YÖNETİCİ TÜM HAREKETLERİ GÖRÜR
      if (isManager) {
        return true;
      }

      // PERSONEL İÇİN TRANSFER
      // KENDİ ŞUBESİ KAYNAK VEYA HEDEFSE GÖSTER
      if (
        movement.type === "TRANSFER"
      ) {

        return (
          movement.from_branch ===
            userBranch ||
          movement.to_branch ===
            userBranch
        );

      }

      // STOK GİRİŞİ
      if (
        movement.type ===
        "STOK GİRİŞİ"
      ) {

        return (
          movement.to_branch ===
          userBranch
        );

      }

      // STOK ÇIKIŞI
      if (
        movement.type ===
        "STOK ÇIKIŞI"
      ) {

        return (
          movement.from_branch ===
          userBranch
        );

      }

      // İMHA
      if (
        movement.type === "İMHA"
      ) {

        return (
          movement.from_branch ===
          userBranch
        );

      }

      return false;

    });

  // =========================
  // İSTATİSTİKLER
  // =========================

  const totalProducts =
    activeProducts.length;

  const criticalProducts =
    activeProducts.filter(
      (p) =>
        Number(p.critical) > 0 &&
        Number(p.stock) <=
          Number(p.critical)
    ).length;

  const outOfStockProducts =
    activeProducts.filter(
      (p) =>
        Number(p.stock) === 0
    ).length;

  const normalProducts =
    activeProducts.filter(
      (p) =>
        Number(p.stock) >
        Number(p.critical)
    ).length;

  // =========================
// BİRİME GÖRE STOK HESABI
// =========================

const adetProducts =
  activeProducts.filter(
    (p) =>
      String(p.unit || "")
        .trim()
        .toUpperCase() === "ADET"
  );

const kgProducts =
  activeProducts.filter(
    (p) =>
      String(p.unit || "")
        .trim()
        .toUpperCase() === "KG"
  );

// ADET ürün sayısı
const adetProductCount =
  adetProducts.length;

// KG ürün sayısı
const kgProductCount =
  kgProducts.length;

// Toplam ADET stok
const totalAdetStock =
  adetProducts.reduce(
    (sum, p) =>
      sum + Number(p.stock || 0),
    0
  );

// Toplam KG stok
const totalKgStock =
  kgProducts.reduce(
    (sum, p) =>
      sum + Number(p.stock || 0),
    0
  );

  const stockInCount =
    visibleMovements.filter(
      (m) =>
        m.type ===
        "STOK GİRİŞİ"
    ).length;

  const stockOutCount =
    visibleMovements.filter(
      (m) =>
        m.type ===
        "STOK ÇIKIŞI"
    ).length;

  const transferCount =
    visibleMovements.filter(
      (m) =>
        m.type ===
        "TRANSFER"
    ).length;

  // =========================
  // ŞUBE SAYISI
  // =========================

  const visibleBranches =
  isManager
    ? branches
    : branches.filter(
        (branch) =>
          normalizeBranch(branch.name) ===
          normalizeBranch(userBranch)
      );

  // =========================
// ŞUBE STOK GRAFİKLERİ
// KG VE ADET AYRI
// =========================

const stockChartKgData =
  visibleBranches.map(
    (branch) => ({

      branch: branch.name,

      stock:
        activeProducts
          .filter(
            (p) =>
              normalizeBranch(p.branch) ===
normalizeBranch(branch.name) &&
              String(p.unit || "")
                .trim()
                .toUpperCase() === "KG"
          )
          .reduce(
            (sum, p) =>
              sum + Number(p.stock || 0),
            0
          ),

    })
  );

const stockChartAdetData =
  visibleBranches.map(
    (branch) => ({

      branch: branch.name,

      stock:
        activeProducts
          .filter(
            (p) =>
              normalizeBranch(p.branch) ===
normalizeBranch(branch.name) &&
              String(p.unit || "")
                .trim()
                .toUpperCase() === "ADET"
          )
          .reduce(
            (sum, p) =>
              sum + Number(p.stock || 0),
            0
          ),

    })
  );

  // PERSONELİN ŞUBESİ VERİTABANINDA
  // AKTİF ŞUBE OLARAK BULUNMUYORSA
  // GRAFİKTE YİNE DE GÖSTER
  let stockChartData = [];
 if (
  !isManager &&
  userBranch &&
  !stockChartData.some(
    (item) =>
      item.branch === userBranch
  )
) {

  const userBranchProducts =
    activeProducts.filter(
      (product) =>
        product.branch === userBranch
    );

  const userBranchStock =
    userBranchProducts.reduce(
      (sum, product) =>
        sum + Number(product.stock || 0),
      0
    );

  stockChartData.push({
    branch: userBranch,
    stock: userBranchStock,
  });

}


  return (

    <div
      style={{
        display: "flex",
      }}
    >

      <Sidebar />

      <div
        style={{
          padding: "30px",
          flex: 1,
        }}
      >

        {/* =========================
            BAŞLIK
        ========================= */}

        <h1>
          Hoş Geldin {userName} 👋
        </h1>

        {/* PERSONEL ŞUBE BİLGİSİ */}

        {!isManager &&
          userBranch && (

            <div
              style={{
                background:
                  "#eff6ff",
                border:
                  "1px solid #93c5fd",
                color:
                  "#1e40af",
                padding:
                  "12px 18px",
                borderRadius:
                  "10px",
                marginTop:
                  "15px",
                marginBottom:
                  "15px",
                fontWeight:
                  "bold",
              }}
            >
              🏪 Aktif Şube:{" "}
              {userBranch}
            </div>

          )}

        {/* =========================
            SİSTEM DURUMU
        ========================= */}

        <div
          style={{
            background:
              outOfStockProducts > 0
                ? "#fee2e2"
                : criticalProducts > 0
                ? "#fef3c7"
                : "#dcfce7",

            color:
              outOfStockProducts > 0
                ? "#991b1b"
                : criticalProducts > 0
                ? "#92400e"
                : "#166534",

            padding: "20px",

            borderRadius: "12px",

            marginTop: "20px",

            marginBottom: "20px",

            fontWeight: "bold",

            fontSize: "18px",
          }}
        >

          {outOfStockProducts > 0
            ? `🔴 Acil! ${outOfStockProducts} ürünün stoğu tamamen bitmiş.`

            : criticalProducts > 0
            ? `🟠 Dikkat! ${criticalProducts} ürün kritik seviyede.`

            : "🟢 Sistem Normal Çalışıyor"}

        </div>

        <h3>
          Furkan Baysak Pastaneleri
        </h3>

        <p>
          PastaFlow Yönetim Paneli
        </p>

        <p
          style={{
            color: "#6b7280",
            fontSize: "15px",
            marginTop: "-5px",
          }}
        >

          📅{" "}
          {currentTime.toLocaleDateString(
            "tr-TR"
          )}

          &nbsp;&nbsp;

          🕒{" "}
          {currentTime.toLocaleTimeString(
            "tr-TR"
          )}

        </p>

        {/* =========================
            YENİLE
        ========================= */}

        <button
          onClick={refreshDashboard}
          style={{
            padding:
              "10px 18px",

            background:
              "#2563eb",

            color: "white",

            border: "none",

            borderRadius:
              "6px",

            cursor:
              "pointer",

            marginTop:
              "15px",

            marginBottom:
              "20px",
          }}
        >
          🔄 Verileri Yenile
        </button>

        {/* =========================
            İSTATİSTİK KARTLARI
        ========================= */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(2,1fr)",

            gap: "20px",

            marginTop:
              "30px",
          }}
        >

          <StatCard
            title="📦 Toplam Ürün"
            value={
              totalProducts
            }
            color="#2563eb"
          />
<StatCard
  title="⚖️ KG Ürün"
  value={kgProductCount}
  color="#0891b2"
/>

<StatCard
  title="🔢 ADET Ürün"
  value={adetProductCount}
  color="#7c3aed"
/>
          <StatCard
            title="⚠️ Kritik Ürün"
            value={
              criticalProducts
            }
            color="#f59e0b"
          />

          <StatCard
            title="🟢 Normal Ürün"
            value={
              normalProducts
            }
            color="#16a34a"
          />

          <StatCard
            title="🔴 Stokta Yok"
            value={
              outOfStockProducts
            }
            color="#dc2626"
          />

          <StatCard
            title="🏪 Toplam Şube"
            value={
              visibleBranches.length
            }
            color="#8b5cf6"
          />

          <StatCard
  title="⚖️ Toplam KG"
  value={`${totalKgStock.toLocaleString("tr-TR", {
    maximumFractionDigits: 3
  })} KG`}
  color="#0ea5e9"
/>

<StatCard
  title="🔢 Toplam ADET"
  value={`${totalAdetStock.toLocaleString("tr-TR", {
    maximumFractionDigits: 0
  })} ADET`}
  color="#6366f1"
/>

          <StatCard
            title="📥 Stok Giriş"
            value={
              stockInCount
            }
            color="#16a34a"
          />

          <StatCard
            title="📤 Stok Çıkış"
            value={
              stockOutCount
            }
            color="#dc2626"
          />

          <StatCard
            title="🚚 Transfer"
            value={
              transferCount
            }
            color="#2563eb"
          />

          {/* =========================
              KRİTİK ÜRÜNLER
          ========================= */}

          <div
            style={{
              background:
                "#fff7ed",

              border:
                "1px solid #fdba74",

              borderRadius:
                "10px",

              padding:
                "20px",

              marginTop:
                "15px",

              marginBottom:
                "30px",
            }}
          >

            <h2
              style={{
                marginTop: 0,

                marginBottom:
                  "20px",

                fontSize:
                  "22px",

                fontWeight:
                  "bold",

                color:
                  "#b45309",
              }}
            >
              ⚠️ Kritik Ürünler
            </h2>

            <div
              style={{
                maxHeight:
                  "500px",

                overflowY:
                  "auto",
              }}
            >

              {activeProducts
                .filter(
                  (p) =>
                    Number(
                      p.critical
                    ) > 0 &&
                    Number(
                      p.stock
                    ) <=
                      Number(
                        p.critical
                      )
                )
                .map(
                  (product) => (

                    <div
                      key={
                        product.id
                      }
                      style={{
                        padding:
                          "15px 0",

                        borderBottom:
                          "1px solid #fed7aa",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "space-between",

                          alignItems:
                            "center",
                        }}
                      >

                        <strong
                          style={{
                            fontSize:
                              "18px",
                          }}
                        >
                          🔴{" "}
                          {
                            product.name
                          }
                        </strong>

                        <span
                          style={{
                            color:
                              Number(
                                product.stock
                              ) ===
                              0
                                ? "#dc2626"
                                : "#ea580c",

                            fontWeight:
                              "bold",
                          }}
                        >
                          {product.stock} / {product.critical} {product.unit || ""}
                        </span>

                      </div>

                      <div
                        style={{
                          marginTop:
                            "8px",
                        }}
                      >
                        🏪 Şube:{" "}
                        <strong>
                          {
                            product.branch
                          }
                        </strong>
                      </div>

                      <div
  style={{
    marginTop: "8px",
  }}
>
  📦 Mevcut Stok:{" "}
  {product.stock}{" "}
  {product.unit || ""}
</div>

<div>
  ⚠️ Kritik Seviye:{" "}
  {product.critical}{" "}
  {product.unit || ""}
</div>

                    </div>

                  )
                )}

            </div>

            {activeProducts.filter(
              (p) =>
                Number(
                  p.critical
                ) > 0 &&
                Number(
                  p.stock
                ) <=
                  Number(
                    p.critical
                  )
            ).length === 0 && (

              <p>
                ✅ Kritik seviyede
                ürün bulunmuyor.
              </p>

            )}

          </div>

        </div>

        {/* =========================
            SON HAREKETLER
        ========================= */}

        <div
          style={{
            background:
              "#f9fafb",

            border:
              "1px solid #ddd",

            borderRadius:
              "10px",

            padding:
              "20px",

            marginTop:
              "15px",

            marginBottom:
              "30px",
          }}
        >

          <h2
            style={{
              marginBottom:
                "20px",
            }}
          >
            📋 Son Hareketler
          </h2>

          {visibleMovements
            .slice(0, 5)
            .map(
              (item) => (

                <div
                  key={
                    item.id
                  }
                  style={{
                    padding:
                      "12px 0",

                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >

                  <strong>

                    {item.type ===
                      "TRANSFER" &&
                      "🚚 "}

                    {item.type ===
                      "STOK GİRİŞİ" &&
                      "📥 "}

                    {item.type ===
                      "STOK ÇIKIŞI" &&
                      "📤 "}

                    {item.type ===
                      "İMHA" &&
                      "🗑️ "}

                    {item.type}

                  </strong>

                  <div>
                    {
                      item.product_name
                    }
                  </div>

                  <div>

                    {item.type ===
                    "TRANSFER"

                      ? `${item.from_branch} → ${item.to_branch}`

                      : item.to_branch ||
                        item.from_branch}

                  </div>

                  <div>
                    Miktar:{" "}
                    {
                      item.amount
                    }
                  </div>

                </div>

              )
            )}

          {visibleMovements.length ===
            0 && (

            <p>
              Henüz hareket
              bulunmuyor.
            </p>

          )}

        </div>

        {/* =========================
            GRAFİKLER
        ========================= */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: "20px",

            marginTop:
              "40px",

            marginBottom:
              "40px",
          }}
        >

          {/* ŞUBE KG STOK */}

<div
  style={{
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.1)",
  }}
>

  <h3>
    ⚖️ Şubelere Göre KG Stoku
  </h3>

  <Bar
    data={{
      labels:
        stockChartKgData.map(
          (item) =>
            item.branch
        ),

      datasets: [
        {
          label: "KG",

          data:
            stockChartKgData.map(
              (item) =>
                item.stock
            ),

          backgroundColor:
            "#2563eb",
        },
      ],
    }}

    options={{
      responsive: true,

      plugins: {
        legend: {
          display: true,
        },
      },

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }}
  />

</div>
          {/* KATEGORİ */}

          <div
            style={{
              background:
                "white",

              padding:
                "20px",

              borderRadius:
                "10px",

              boxShadow:
                "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >

            {/* ŞUBE ADET STOK */}

<div
  style={{
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.1)",
  }}
>

  <h3>
    🔢 Şubelere Göre ADET Stoku
  </h3>

  <Bar
    data={{
      labels:
        stockChartAdetData.map(
          (item) =>
            item.branch
        ),

      datasets: [
        {
          label: "ADET",

          data:
            stockChartAdetData.map(
              (item) =>
                item.stock
            ),

          backgroundColor:
            "#16a34a",
        },
      ],
    }}

    options={{
      responsive: true,

      plugins: {
        legend: {
          display: true,
        },
      },

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }}
  />

</div>

        

          </div>

        </div>

        {/* =========================
            SİSTEM DURUMU
        ========================= */}

        <div
          style={{
            background:
              "#ecfdf5",

            border:
              "1px solid #10b981",

            borderRadius:
              "10px",

            padding:
              "20px",

            marginBottom:
              "30px",
          }}
        >

          <h2
            style={{
              marginTop: 0,

              color:
                "#047857",
            }}
          >
            🟢 Sistem Durumu
          </h2>

          <div
            style={{
              lineHeight:
                "2",
            }}
          >

            🗄️ Veritabanı :
            <strong>
              {" "}Çalışıyor
            </strong>

            <br />

            🌐 API :
            <strong>
              {" "}Çalışıyor
            </strong>

            <br />

            📦 Ürün Sayısı :
            <strong>
              {" "}
              {
                activeProducts.length
              }
            </strong>

            <br />

            🏪 Görüntülenen Şube :
            <strong>
              {" "}
              {isManager
                ? "Tüm Şubeler"
                : userBranch}
            </strong>

            <br />

            🔄 Son Yenileme :
            <strong>
              {" "}
              {currentTime.toLocaleTimeString(
                "tr-TR"
              )}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;