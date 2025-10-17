import { useState } from "react";
import { MetricChart } from "./MetricChart";

export function DistanceChart({ data, algorithmName = "ACO" }) {
  const [selected, setSelected] = useState("bestScore");

  const options = [
    { key: "bestScore", label: "Najlepszy", color: "#4CAF50", trendColor: "#FFC107" },
    { key: "averageScore", label: "Średni", color: "#2196F3", trendColor: "#00BCD4" },
    { key: "worstScore", label: "Najgorszy", color: "#F44336", trendColor: "#FF5722" },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 10, fontSize: 18, color: "#333" }}>
        Wybierz wykres dystansów
      </h3>

      {/* 🔘 Przyciski wyboru */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSelected(opt.key)}
            style={{
              padding: "6px 12px",
              cursor: "pointer",
              background: selected === opt.key ? opt.color : "#f0f0f0",
              color: selected === opt.key ? "#fff" : "#333",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 🔹 Właściwy wykres */}
      {options.map(opt => 
        opt.key === selected && (
          <MetricChart
            key={opt.key}
            data={data}
            dataKey={opt.key}
            name={opt.label}
            color={opt.color}
            trendColor={opt.trendColor}
            algorithmName={algorithmName}
            showTrend={true}
          />
        )
      )}
    </div>
  );
}
