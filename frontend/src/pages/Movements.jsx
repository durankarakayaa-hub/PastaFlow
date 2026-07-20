import { useEffect, useState } from "react";

function Movements() {

  const [movements, setMovements] = useState([]);
const [search, setSearch] = useState("");
const [selectedType, setSelectedType] = useState("");
const [selectedBranch, setSelectedBranch] = useState("");
  useEffect(() => {
    loadMovements();
  }, []);


  const loadMovements = async () => {

    const response = await fetch(
      "http://localhost:3001/movements"
    );

    const data = await response.json();

    setMovements(data);

  };


  return (
    <div style={{ padding:"30px" }}>

      <h1>📜 Stok Hareketleri</h1>
<input
  type="text"
  placeholder="🔍 Ürün Ara..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "300px",
    padding: "10px",
    marginTop: "20px",
    marginBottom: "20px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
/>
<select
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
  style={{
    marginLeft: "15px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
>
  <option value="">Tüm Hareketler</option>
  <option value="STOK GİRİŞİ">📥 Stok Girişi</option>
  <option value="STOK ÇIKIŞI">📤 Stok Çıkışı</option>
  <option value="TRANSFER">🚚 Transfer</option>
</select>
<select
  value={selectedBranch}
  onChange={(e) => setSelectedBranch(e.target.value)}
  style={{
    marginLeft: "15px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
>
  <option value="">Tüm Şubeler</option>
  <option value="Aksaray">Aksaray</option>
  <option value="Bahçelievler">Bahçelievler</option>
  <option value="Ankara">Ankara</option>
</select>
      <table
        style={{
          width:"100%",
          borderCollapse:"collapse",
          marginTop:"20px"
        }}
      >

        <thead>

          <tr style={{background:"#f3f4f6"}}>

            <th style={{padding:"10px",border:"1px solid #ddd"}}>
              Tarih
            </th>

            <th style={{padding:"10px",border:"1px solid #ddd"}}>
              İşlem
            </th>

            <th style={{padding:"10px",border:"1px solid #ddd"}}>
              Ürün
            </th>

            <th style={{padding:"10px",border:"1px solid #ddd"}}>
              Şube
            </th>

            <th style={{padding:"10px",border:"1px solid #ddd"}}>
              Miktar
            </th>

          </tr>

        </thead>


        <tbody>

        {movements
  .filter((item) => {
    const searchMatch = item.product_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const typeMatch =
      selectedType === "" || item.type === selectedType;

    const branchName =
      item.type === "TRANSFER"
        ? `${item.from_branch} ${item.to_branch}`
        : item.to_branch || item.from_branch;

    const branchMatch =
      selectedBranch === "" ||
      branchName.includes(selectedBranch);

    return searchMatch && typeMatch && branchMatch;
  })
  .map((item) => (

          <tr key={item.id}>

            <td style={{padding:"10px",border:"1px solid #ddd"}}>
              {item.created_at}
            </td>


            <td style={{padding:"10px",border:"1px solid #ddd"}}>
              {item.type}
            </td>


            <td style={{padding:"10px",border:"1px solid #ddd"}}>
              {item.product_name}
            </td>


            <td style={{padding:"10px",border:"1px solid #ddd"}}>

              {
                item.type === "TRANSFER"
                ?
                `${item.from_branch} → ${item.to_branch}`
                :
                item.to_branch || item.from_branch
              }

            </td>


            <td style={{padding:"10px",border:"1px solid #ddd"}}>
              {item.amount}
            </td>


          </tr>

        ))}


        </tbody>


      </table>


    </div>
  );
}


export default Movements;