// src/components/result/AlgorithmResultPanel.jsx
import React from "react";

export default function AlgorithmResultPanel({ result, addPanel, onShowPheromones }) {
  if (!result) return null;

  const shortestDistance =
    result.results?.shortestDistance !== undefined
      ? Number(result.results.shortestDistance).toFixed(2)
      : "-";

  const hasPheromoneData = result.iterationResults?.some(
    iter => iter.pheromoneSnapshot
  );

  return (
    <div className="result-panel result-panel-top">
      <h3>Wyniki algorytmu</h3>
      {result.success && (
        <div>
          <p><strong>Ścieżka:</strong> {result.path?.join(" → ")}</p>
          <p><strong>Najlepszy dystans:</strong> {result.results.bestFitness}</p>

          <div style={{ marginBottom: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {/* 🔹 Tabela */}
            <button className="result-button" onClick={() => addPanel("table", result.iterationResults)}>
              Otwórz tabelę
            </button>

            {/* 🔹 Wykresy podstawowe */}
            <button className="result-button" onClick={() => addPanel("charts-distance", result.iterationResults)}>
              Wykresy dystansów
            </button>

            {/* 🔹 Nowe metryki ACO */}
            <button className="result-button" onClick={() => addPanel("charts-violations", result.iterationResults)}>
              Niedopuszczalne ścieżki
            </button>
            <button className="result-button" onClick={() => addPanel("charts-diversity", result.iterationResults)}>
              Różnorodność ścieżek
            </button>
            <button className="result-button" onClick={() => addPanel("charts-stagnation", result.iterationResults)}>
              Zastój iteracji
            </button>

            {/* 🔹 Wizualizacja feromonów */}
            {hasPheromoneData && (
              <button 
                className="result-button"
                style={{ 
                  background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)" 
                }}
                onClick={() => {
                  onShowPheromones(result.iterationResults);
                }}
              >
                🐜 Wizualizacja feromonów
              </button>
            )}
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