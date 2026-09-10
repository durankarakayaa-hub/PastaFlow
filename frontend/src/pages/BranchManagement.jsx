import { useEffect, useState } from "react";

function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
const loadBranches = async () => {
  const response = await fetch("http://localhost:3001/branches");
  const data = await response.json();
  setBranches(data);
};
useEffect(() => {
  loadBranches();
}, []);
  const addBranch = async () => {
    const response = await fetch("http://localhost:3001/branches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        name,
      }),
    });

    const data = await response.json();

    alert(data.message);
    if (data.success) {
  setCode("");
  setName("");
  loadBranches();
}
  };
const editBranch = (branch) => {
    setEditingId(branch.id);
    setCode(branch.code);
    setName(branch.name);
  };

  const updateBranch = async () => {
    const response = await fetch(
      `http://localhost:3001/branches/${editingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          name,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    if (data.success) {
      setEditingId(null);
      setCode("");
      setName("");
      loadBranches();
    }
  };

  const toggleBranchStatus = async (branch) => {
    const response = await fetch(
      `http://localhost:3001/branches/${branch.id}/status`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    alert(data.message);

    if (data.success) {
      loadBranches();
    }
  };
  return (
    <div style={{ padding: "30px", maxWidth: "500px" }}>
      <h1>🏪 Şube Yönetimi</h1>

      <input
        placeholder="Şube Kodu"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      />

      <input
        placeholder="Şube Adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={editingId ? updateBranch : addBranch}
        style={{
          width: "100%",
          padding: "12px",
          background: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {editingId ? "💾 Şubeyi Güncelle" : "➕ Şube Ekle"}
      </button>
      <hr style={{ margin: "30px 0" }} />

<h2>Mevcut Şubeler</h2>

<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
  }}
>
  <thead>
    <tr>
      <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
        Kod
      </th>
      <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
        Şube
      </th>
      <th
  style={{
    borderBottom: "1px solid #ccc",
    textAlign: "left",
    padding: "8px",
  }}
>
  İşlem
</th>
    </tr>

  </thead>

  <tbody>
    {branches.map((branch) => (
      <tr key={branch.id}>
        <td style={{ padding: "8px" }}>{branch.code}</td>
        <td style={{ padding: "8px" }}>{branch.name}</td>
        <td style={{ padding: "8px" }}>
  <button
  onClick={() => editBranch(branch)}
    style={{
      marginRight: "8px",
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "4px",
      padding: "5px 10px",
      cursor: "pointer",
    }}
  >
    ✏️ Düzenle
  </button>

  <button
  onClick={() => toggleBranchStatus(branch)}
    style={{
      background: "#dc2626",
      color: "white",
      border: "none",
      borderRadius: "4px",
      padding: "5px 10px",
      cursor: "pointer",
    }}
  >
    {branch.status === "PASIF" ? "🟢 Aktifleştir" : "🗑️ Pasife Al"}
  </button>
</td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  );
}

export default BranchManagement;