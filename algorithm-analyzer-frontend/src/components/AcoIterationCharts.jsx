import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AcoIterationCharts({ data }) {
  const [visibleLines, setVisibleLines] = useState({
    best: true,
    avg: true,
    worst: true,
    time: true,
  });

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: "1rem",
          textAlign: "center",
          color: "#666",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginTop: "1rem",
        }}
      >
        Brak danych iteracji do wyświetlenia.
      </div>
    );
  }

  const toggleLine = (key) =>
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      style={{
        background: "#fff",
        padding: "1rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginTop: "1.5rem",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
        📈 Postęp długości ścieżek w iteracjach (ACO)
      </h3>

      {/* 🔘 przyciski do przełączania widoczności */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <button onClick={() => toggleLine("best")}>
          {visibleLines.best ? "Ukryj najlepsze" : "Pokaż najlepsze"}
        </button>
        <button onClick={() => toggleLine("avg")}>
          {visibleLines.avg ? "Ukryj średnie" : "Pokaż średnie"}
        </button>
        <button onClick={() => toggleLine("worst")}>
          {visibleLines.worst ? "Ukryj najgorsze" : "Pokaż najgorsze"}
        </button>
        <button onClick={() => toggleLine("time")}>
          {visibleLines.time ? "Ukryj czas" : "Pokaż czas"}
        </button>
      </div>

      {/* 🧭 wykres */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="iteration"
            label={{
              value: "Iteracja",
              position: "insideBottomRight",
              offset: -5,
            }}
          />
          <YAxis
            yAxisId="left"
            label={{
              value: "Długość ścieżki",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "Czas [ms]",
              angle: -90,
              position: "insideRight",
            }}
          />
          <Tooltip />
          <Legend />

          {visibleLines.best && (
            <Line
              type="monotone"
              dataKey="bestDistance"
              stroke="#4CAF50"
              name="Najlepsza"
              yAxisId="left"
              dot={false}
              strokeWidth={2}
            />
          )}
          {visibleLines.avg && (
            <Line
              type="monotone"
              dataKey="averageDistance"
              stroke="#2196F3"
              name="Średnia"
              yAxisId="left"
              dot={false}
              strokeWidth={2}
            />
          )}
          {visibleLines.worst && (
            <Line
              type="monotone"
              dataKey="worstDistance"
              stroke="#F44336"
              name="Najgorsza"
              yAxisId="left"
              dot={false}
              strokeWidth={2}
            />
          )}
          {visibleLines.time && (
            <Line
              type="monotone"
              dataKey="executionDurationMs"
              stroke="#9C27B0"
              name="Czas [ms]"
              yAxisId="right"
              dot={false}
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
