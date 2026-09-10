import { useEffect, useState } from "react";

function Movements() {

  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {

    try {

      setLoading(true);

     const token =
  localStorage.getItem("pastaflow_token");

const [movementResponse, branchResponse] =
  await Promise.all([
    fetch("http://localhost:3001/stock-movements", {
      headers: {
        Authorization: "Bearer " + token,
      },
    }),

    fetch("http://localhost:3001/branches", {
      headers: {
        Authorization: "Bearer " + token,
      },
    }),
  ]);

      const movementData = await movementResponse.json();
const branchData = await branchResponse.json();

setMovements(
  movementData.success
    ? movementData.movements
    : []
);

setBranches(branchData);

    } catch (error) {

      console.error(
        "Hareketler yüklenirken hata oluştu:",
        error
      );

    } finally {

      setLoading(false);

    }

  };

  const filteredMovements = movements.filter((item) => {

    const searchMatch =
      item.product_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const typeMatch =
      selectedType === "" ||
      item.type === selectedType;

    const branchMatch =
      selectedBranch === "" ||
      item.from_branch === selectedBranch ||
      item.to_branch === selectedBranch;

    return (
      searchMatch &&
      typeMatch &&
      branchMatch
    );

  });

  const getMovementIcon = (type) => {

    if (type === "STOK GİRİŞİ") return "📥";
    if (type === "STOK ÇIKIŞI") return "📤";
    if (type === "TRANSFER") return "🚚";
    if (type === "İMHA") return "🗑️";

    return "📋";

  };

  const getMovementColor = (type) => {

    if (type === "STOK GİRİŞİ") return "#16a34a";
    if (type === "STOK ÇIKIŞI") return "#dc2626";
    if (type === "TRANSFER") return "#2563eb";
    if (type === "İMHA") return "#ea580c";

    return "#6b7280";

  };

  const getBranchText = (item) => {

    if (item.type === "TRANSFER") {

      return `${item.from_branch} → ${item.to_branch}`;

    }

    if (item.to_branch) {

      return item.to_branch;

    }

    if (item.from_branch) {

      return item.from_branch;

    }

    return "-";

  };

  return (

    <div
      style={{
        padding: "30px"
      }}
    >

      <h1>📜 Stok Hareketleri</h1>

      <p
        style={{
          color: "#6b7280",
          marginTop: "-10px"
        }}
      >
        Sistemde gerçekleşen tüm stok hareketlerini buradan
        takip edebilirsiniz.
      </p>


      {/* FİLTRELER */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "25px",
          marginBottom: "25px"
        }}
      >

        <input
          type="text"
          placeholder="🔍 Ürün Ara..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "280px",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />


        <select
          value={selectedType}
          onChange={(e) =>
            setSelectedType(e.target.value)
          }
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        >

          <option value="">
            Tüm Hareketler
          </option>

          <option value="STOK GİRİŞİ">
            📥 Stok Girişi
          </option>

          <option value="STOK ÇIKIŞI">
            📤 Stok Çıkışı
          </option>

          <option value="TRANSFER">
            🚚 Transfer
          </option>

          <option value="İMHA">
            🗑️ İmha
          </option>

        </select>


        <select
          value={selectedBranch}
          onChange={(e) =>
            setSelectedBranch(e.target.value)
          }
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        >

          <option value="">
            Tüm Şubeler
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
          onClick={loadMovements}
          style={{
            padding: "10px 15px",
            border: "none",
            borderRadius: "6px",
            background: "#2563eb",
            color: "white",
            cursor: "pointer"
          }}
        >
          🔄 Yenile
        </button>

      </div>


      {/* ÖZET */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px"
        }}
      >

        <div
          style={{
            padding: "15px 20px",
            background: "#f3f4f6",
            borderRadius: "8px"
          }}
        >
          📋 Toplam Hareket:
          <strong> {filteredMovements.length}</strong>
        </div>


        <div
          style={{
            padding: "15px 20px",
            background: "#dcfce7",
            borderRadius: "8px"
          }}
        >
          📥 Giriş:
          <strong>
            {
              filteredMovements.filter(
                (item) =>
                  item.type === "STOK GİRİŞİ"
              ).length
            }
          </strong>
        </div>


        <div
          style={{
            padding: "15px 20px",
            background: "#fee2e2",
            borderRadius: "8px"
          }}
        >
          📤 Çıkış:
          <strong>
            {
              filteredMovements.filter(
                (item) =>
                  item.type === "STOK ÇIKIŞI"
              ).length
            }
          </strong>
        </div>


        <div
          style={{
            padding: "15px 20px",
            background: "#dbeafe",
            borderRadius: "8px"
          }}
        >
          🚚 Transfer:
          <strong>
            {
              filteredMovements.filter(
                (item) =>
                  item.type === "TRANSFER"
              ).length
            }
          </strong>
        </div>


        <div
          style={{
            padding: "15px 20px",
            background: "#ffedd5",
            borderRadius: "8px"
          }}
        >
          🗑️ İmha:
          <strong>
            {
              filteredMovements.filter(
                (item) =>
                  item.type === "İMHA"
              ).length
            }
          </strong>
        </div>

      </div>


      {/* TABLO */}

      <div
        style={{
          overflowX: "auto",
          background: "white",
          borderRadius: "10px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >

          <thead>

            <tr
              style={{
                background: "#f3f4f6"
              }}
            >

              <th style={thStyle}>
                Tarih
              </th>

              <th style={thStyle}>
                İşlem
              </th>

              <th style={thStyle}>
                Ürün
              </th>

              <th style={thStyle}>
                Şube
              </th>

              <th style={thStyle}>
                Miktar
              </th>

            </tr>

          </thead>


          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="5"
                  style={{
                    padding: "30px",
                    textAlign: "center"
                  }}
                >
                  ⏳ Hareketler yükleniyor...
                </td>

              </tr>

            ) : filteredMovements.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6b7280"
                  }}
                >
                  📭 Gösterilecek hareket bulunamadı.
                </td>

              </tr>

            ) : (

              filteredMovements.map(
                (item) => (

                  <tr key={item.id}>

                    <td style={tdStyle}>
                      {item.created_at}
                    </td>


                    <td style={tdStyle}>

                      <span
                        style={{
                          color:
                            getMovementColor(
                              item.type
                            ),
                          fontWeight: "bold"
                        }}
                      >

                        {getMovementIcon(
                          item.type
                        )}

                        {" "}

                        {item.type}

                      </span>

                    </td>


                    <td style={tdStyle}>

                      <strong>
                        {item.product_name}
                      </strong>

                    </td>


                    <td style={tdStyle}>

                      {getBranchText(item)}

                    </td>


                    <td style={tdStyle}>

                      <strong>
                        {item.amount}
                      </strong>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}


const thStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "left"
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd"
};


export default Movements;