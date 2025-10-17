import React from "react";
import '../../App.css'; 

export default function AlgorithmResultPanel({ result, addPanel }) { // Prop `onShowPheromones` usunięty
  if (!result) return null;
  
  const formatSolution = (solution) => {
    if (!solution || solution.length === 0) return "Brak danych";
    const formatted = solution.join(" → ");
    return `${formatted} → ${solution[0]}`;
  };

  return (
    <div className="result-panel result-panel-top">
      <h3>Wynik końcowy: {result.algorithmName}</h3>
      {result.success ? (
        <div className="result-content">
          <div className="result-metric">
            <strong>🏆 Najlepszy wynik (dystans):</strong>
            <span>{result.bestScore != null ? `${parseFloat(result.bestScore).toFixed(2)} km` : "Brak danych"}</span>
          </div>
          
          <div className="result-metric">
            <strong>⏱️ Czas wykonania:</strong>
            <span>{result.executionDurationMs != null ? `${result.executionDurationMs.toFixed(2)} ms` : "Brak danych"}</span>
          </div>

          <div className="result-metric full-width">
            <strong>📍 Najlepsza znaleziona trasa:</strong>
            <p className="solution-path">{formatSolution(result.bestSolution)}</p>
          </div>

          <div className="result-buttons">
            <button className="result-button" onClick={() => addPanel("table", result)}>
              📊 Tabela iteracji
            </button>
            <button className="result-button" onClick={() => addPanel("charts-distance", result)}>
              📈 Wykresy wyników
            </button>
            <button className="result-button" onClick={() => addPanel("charts-diversity", result)}>
              🧬 Różnorodność
            </button>
            <button className="result-button" onClick={() => addPanel("charts-stagnation", result)}>
              ⏳ Stagnacja
            </button>
            {/* Przycisk do wizualizacji feromonów został usunięty */}
          </div>
        </div>
      ) : (
        <div className="error">
          <p><strong>Wystąpił błąd:</strong> {result.errorMessage || "Nieznany błąd serwera"}</p>
        </div>
      )}
    </div>
  );
}