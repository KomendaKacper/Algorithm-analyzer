import { useState } from "react";
import { SingleDistanceChart } from "./SingleDistanceChart";

export function DistanceChart({ data, showTrend = true }) {
  const [selected, setSelected] = useState("bestDistance");

  const charts = [
    { key: "bestDistance", name: "Najlepszy", color: "#4CAF50", trendColor: "#FFC107" },
    { key: "averageDistance", name: "Średni", color: "#2196F3", trendColor: "#00BCD4" },
    { key: "worstDistance", name: "Najgorszy", color: "#F44336", trendColor: "#FF5722" },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      {/* 🔹 Tytuł */}
      <h3 style={{ marginBottom: 10, fontSize: 18, color: "#333" }}>
        Wybierz wykres dystansów
      </h3>

      {/* 🔹 Przełącznik wykresów */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        {charts.map(c => (
          <button
            key={c.key}
            onClick={() => setSelected(c.key)}
            style={{
              padding: "6px 12px",
              cursor: "pointer",
              background: selected === c.key ? "#3498db" : "#f0f0f0",
              color: selected === c.key ? "#fff" : "#333",
              border: "none",
              borderRadius: 6,
              fontWeight: 600
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* 🔹 Właściwy wykres */}
      {charts.map(c => 
        c.key === selected && (
          <SingleDistanceChart
            key={c.key}
            data={data}
            dataKey={c.key}
            name={c.name}
            color={c.color}
            trendColor={c.trendColor}
            showTrend={showTrend}
            height={300} // większy wykres na raz
          />
        )
      )}
    </div>
  );
}
