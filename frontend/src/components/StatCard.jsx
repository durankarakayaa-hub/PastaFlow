function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderLeft: `6px solid ${color}`,
      }}
    >
      <h3 style={{ margin: 0 }}>{title}</h3>

      <h1 style={{ marginTop: "15px" }}>{value}</h1>
    </div>
  );
}

export default StatCard;