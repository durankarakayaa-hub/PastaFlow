import { useEffect, useState } from "react";

function UserManagement() {
const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [fullname, setFullname] = useState("");
const [role, setRole] = useState("PERSONEL");
const [branch, setBranch] = useState("MERKEZ");
  const loadUsers = async () => {

    const response = await fetch("https://pastaflow.onrender.com/users");
    const data = await response.json();

    setUsers(data);

  };
const addUser = async () => {

  const response = await fetch(
  editingId
    ? `https://pastaflow.onrender.com/users/${editingId}`
    : "https://pastaflow.onrender.com/users",
  {
    method: editingId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      fullname,
      role,
      branch,
    }),
  });

  const data = await response.json();

  alert(data.message);

  if (data.success) {

    setUsername("");
    setPassword("");
    setFullname("");
    setRole("PERSONEL");
    setBranch("MERKEZ");
setEditingId(null);
    loadUsers();

  }

};
  useEffect(() => {
    loadUsers();
  }, []);

  return (

    <div style={{padding:"30px",maxWidth:"700px"}}>

      <h1>👤 Kullanıcı Yönetimi</h1>
<div style={{ marginTop: "25px", marginBottom: "30px" }}>

  <input
    placeholder="Kullanıcı Adı"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
  />

  <input
    type="password"
    placeholder="Şifre"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
  />

  <input
    placeholder="Ad Soyad"
    value={fullname}
    onChange={(e) => setFullname(e.target.value)}
    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
  />

  <select
    value={role}
    onChange={(e) => setRole(e.target.value)}
    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
  >
    <option>YONETICI</option>
    <option>SUBE MUDURU</option>
    <option>PERSONEL</option>
  </select>

  <input
    placeholder="Şube"
    value={branch}
    onChange={(e) => setBranch(e.target.value)}
    style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
  />

  <button
    onClick={addUser}
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
    {editingId ? "💾 Güncelle" : "➕ Kullanıcı Ekle"}
  </button>

</div>
      <table
      style={{
        width:"100%",
        borderCollapse:"collapse",
        marginTop:"25px"
      }}>

        <thead>

          <tr>

            <th>Kullanıcı</th>
            <th>Ad Soyad</th>
            <th>Rol</th>
            <th>Şube</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>

        </thead>

        <tbody>

          {users.map(user=>(

            <tr key={user.id}>

              <td>{user.username}</td>

              <td>{user.fullname}</td>

              <td>{user.role}</td>

              <td>{user.branch}</td>

              <td>{user.status}</td>
<td>

  <button
  onClick={() => {

    setEditingId(user.id);

    setUsername(user.username);

    setPassword(user.password);

    setFullname(user.fullname);

    setRole(user.role);

    setBranch(user.branch);

  }}
    style={{
      background:"#2563eb",
      color:"white",
      border:"none",
      padding:"6px 12px",
      borderRadius:"5px",
      cursor:"pointer"
    }}
  >
    ✏️ Düzenle
  </button>

</td>
            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default UserManagement;