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
const refreshDashboard = async () => {
  try {
    const productsData = await getProducts();
    setProducts(productsData);

    const movementResponse = await fetch("http://127.0.0.1:3001/movements");
    const movementData = await movementResponse.json();
    setMovements(movementData);
  } catch (err) {
    console.log(err);
  }
};
  useEffect(() => {
  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  loadProducts();
}, []);
useEffect(() => {
  fetch("http://127.0.0.1:3001/movements")
    .then((res) => res.json())
    .then((data) => setMovements(data))
    .catch((err) => console.log(err));
}, []);
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);
const stockChartData = [...new Set(products.map((p) => p.branch))].map(
  (branch) => ({
    branch,
    stock: products
      .filter((p) => p.branch === branch)
      .reduce((sum, p) => sum + p.stock, 0),
  })
);

const categoryChartData = [...new Set(products.map((p) => p.category))].map(
  (category) => ({
    name: category,
    value: products.filter((p) => p.category === category).length,
  })
);
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "30px", flex: 1 }}>
        <h1>Hoş Geldin Duran 👋</h1>

        <h3>Furkan Baysak Pastaneleri</h3>

        <p>PastaFlow Yönetim Paneli</p>
        <p
  style={{
    color: "#6b7280",
    fontSize: "15px",
    marginTop: "-5px",
  }}
>
  📅 {currentTime.toLocaleDateString("tr-TR")} &nbsp;&nbsp;
  🕒 {currentTime.toLocaleTimeString("tr-TR")}
</p>
<button
  onClick={refreshDashboard}
  style={{
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "15px",
    marginBottom: "20px",
  }}
>
  🔄 Verileri Yenile
</button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <StatCard
            title="📦 Toplam Ürün"
            value={products.length}
            color="#2563eb"
          />

          <StatCard
            title="⚠️ Kritik Ürün"
            value={products.filter((p) => p.stock <= p.critical).length}
            color="#f59e0b"
          />
<StatCard
  title="🏪 Toplam Şube"
  value={[...new Set(products.map((p) => p.branch))].length}
  color="#8b5cf6"
/>
<StatCard
  title="📈 Toplam Stok"
  value={products.reduce((total, product) => total + product.stock, 0)}
  color="#0ea5e9"
/>
          

         <StatCard
  title="📥 Stok Giriş"
  value={
    movements.filter(
      (m) => m.type === "STOK GİRİŞİ"
    ).length
  }
  color="#16a34a"
/>

<StatCard
  title="📤 Stok Çıkış"
  value={
    movements.filter(
      (m) => m.type === "STOK ÇIKIŞI"
    ).length
  }
  color="#dc2626"
/>

<StatCard
  title="🚚 Transfer"
  value={
    movements.filter(
      (m) => m.type === "TRANSFER"
    ).length
  }
  color="#2563eb"
/>

      <h2 style={{ marginTop: "40px" }}>
  ⚠️ Kritik Stoklar
</h2>

<div
  style={{
    background: "#fff7ed",
    border: "1px solid #fdba74",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "15px",
    marginBottom: "30px",
  }}
>

{products
  .filter((p) => p.stock <= p.critical)
  .map((product) => (

    <div
      key={product.id}
      style={{
        padding: "15px 0",
        borderBottom: "1px solid #fed7aa",
      }}
    >

      <div
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center"
        }}
      >

        <strong style={{fontSize:"18px"}}>
          🔴 {product.name}
        </strong>


        <span
          style={{
            color:
              product.stock === 0
              ? "#dc2626"
              : "#ea580c",
            fontWeight:"bold"
          }}
        >
          {product.stock} / {product.critical}
        </span>

      </div>


      <div style={{marginTop:"8px"}}>
        🏪 Şube: <strong>{product.branch}</strong>
      </div>


      <div style={{marginTop:"5px"}}>
        📦 Mevcut Stok: {product.stock}
      </div>


      <div>
        ⚠️ Kritik Seviye: {product.critical}
      </div>


    </div>

  ))}


{products.filter((p) => p.stock <= p.critical).length === 0 && (

  <p>
    ✅ Kritik seviyede ürün bulunmuyor.
  </p>

)}

</div>

  
</div>


<div
  style={{
    background: "#f9fafb",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "15px",
    marginBottom: "30px",
  }}
>
<h2 style={{ marginBottom: "20px" }}>
  📋 Son Hareketler
</h2>
  {movements.slice(0, 5).map((item) => (

    <div
      key={item.id}
      style={{
        padding: "12px 0",
        borderBottom: "1px solid #e5e7eb",
      }}
    >

      <strong>
        {item.type === "TRANSFER" && "🚚 "}
        {item.type === "STOK GİRİŞİ" && "📥 "}
        {item.type === "STOK ÇIKIŞI" && "📤 "}

        {item.type}
      </strong>

      <div>
        {item.product_name}
      </div>

      <div>
        {
          item.type === "TRANSFER"
          ?
          `${item.from_branch} → ${item.to_branch}`
          :
          item.to_branch || item.from_branch
        }
      </div>

      <div>
        Miktar: {item.amount}
      </div>

    </div>

  ))}


  {movements.length === 0 && (
    <p>Henüz hareket bulunmuyor.</p>
  )}

</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "40px",
    marginBottom: "40px",
  }}
>
  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}
  >
    <h3>📦 Şubelere Göre Toplam Stok</h3>
<Bar
  data={{
    labels: stockChartData.map((item) => item.branch),
    datasets: [
      {
        label: "Toplam Stok",
        data: stockChartData.map((item) => item.stock),
        backgroundColor: "#2563eb",
      },
    ],
  }}
/>

</div>

<div
  style={{
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  }}
>
  <h3>🥧 Kategori Dağılımı</h3>

  <Pie
    data={{
      labels: categoryChartData.map((item) => item.name),
      datasets: [
        {
          data: categoryChartData.map((item) => item.value),
          backgroundColor: [
            "#2563eb",
            "#16a34a",
            "#f59e0b",
            "#dc2626",
            "#8b5cf6",
            "#0ea5e9",
          ],
        },
      ],
    }}
  />
</div>

</div>

        <h2 style={{ marginTop: "40px" }}>Ürün Listesi</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Ürün</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Kategori</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Şube</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Stok</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Kritik</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {product.name}
                </td>

                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {product.category}
                </td>

                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {product.branch}
                </td>

                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {product.stock}
                </td>

                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {product.critical}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;