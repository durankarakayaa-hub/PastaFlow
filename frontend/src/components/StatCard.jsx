function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        borderLeft: `6px solid ${color}`,
        transition: "all 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
    >
      <h3
        style={{
          margin: 0,
          color: "#374151",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          marginTop: "18px",
          marginBottom: 0,
          fontSize: "48px",
          textAlign: "center",
          color: "#111827",
        }}
      >
        {value}
      </h1>
    </div>
  );
}

export default StatCard;