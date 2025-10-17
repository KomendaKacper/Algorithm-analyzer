import { useState } from "react";
import { MetricChart } from "./MetricChart";

export function ScoreChart({ results, problemName = "" }) {
  const [selected, setSelected] = useState("bestScore");

  const isTsp = problemName.toLowerCase().includes("salesman");
  const chartTitle = isTsp ? "Porównanie Dystansów" : "Porównanie Wartości";
  const yAxisUnit = isTsp ? "(km)" : "";

  const options = [
    { key: "bestScore", label: `Najlepszy wynik ${yAxisUnit}` },
    { key: "currentScore", label: `Bieżący wynik ${yAxisUnit}`}, // Dla SA
  ];

  return (
    <div style={{ marginBottom: 20, width: '100%' }}>
      <h3 style={{ marginBottom: 10, fontSize: 18, color: "#333" }}>{chartTitle}</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <button key={opt.key} onClick={() => setSelected(opt.key)} /* ...style... */>
            {opt.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {options.map(opt => 
        opt.key === selected && (
          <MetricChart
            key={opt.key}
            results={results} // Przekazujemy całą listę wyników
            dataKey={opt.key}
            name={opt.label}
          />
        )
      )}
    </div>
  );
}