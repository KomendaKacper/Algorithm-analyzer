// src/components/result/AlgorithmResultPanel.jsx
import React from "react";

export default function AlgorithmResultPanel({ result, addPanel }) {
  if (!result) return null;

  return (
    <div className="result-panel-top">
      <h3>Wyniki algorytmu</h3>
      {result.success && (
        <div>
          <p><strong>Ścieżka:</strong> {result.path?.join(" → ")}</p>

          <div style={{ marginBottom: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {/* 🔹 Tabela */}
            <button className="panel-btn" onClick={() => addPanel("table", result.iterationResults)}>
              Otwórz tabelę
            </button>

            {/* 🔹 Wykresy podstawowe */}
            <button className="panel-btn" onClick={() => addPanel("charts-distance", result.iterationResults)}>
              Wykres dystansów
            </button>
            <button className="panel-btn" onClick={() => addPanel("charts-time", result.iterationResults)}>
              Wykres czasu
            </button>
            <button className="panel-btn" onClick={() => addPanel("charts-gap", result.iterationResults)}>
              Różnica
            </button>
            <button className="panel-btn" onClick={() => addPanel("charts-improvement", result.iterationResults)}>
              Tempo poprawy
            </button>
            <button className="panel-btn" onClick={() => addPanel("charts-efficiency", result.iterationResults)}>
              Efektywność
            </button>
          </div>
        </div>
      )}

      {!result.success && (
        <div className="error">
          <p>Błąd: {result.errorMessage || "Nieznany błąd"}</p>
        </div>
      )}
    </div>
  );
}
