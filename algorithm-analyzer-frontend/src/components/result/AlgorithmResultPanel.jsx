import React from "react";
import '../../App.css'; 

// Konfiguracja problemów pozostaje bez zmian
const problemConfig = {
  "Traveling Salesman Problem (TSP)": {
    isMaximization: false,
    solutionLabel: "Najlepsza znaleziona trasa",
    scoreLabel: "Najlepszy wynik (dystans)",
    unit: "km",
    icon: "📍",
    format: (solution) => solution && solution.length > 0 ? `${solution.join(" → ")} → ${solution[0]}` : "Brak danych"
  },
  "Knapsack Problem": {
    isMaximization: true,
    solutionLabel: "Przedmioty w plecaku",
    scoreLabel: "Najlepszy wynik (wartość)",
    unit: "",
    icon: "🎒",
    format: (solution) => solution && solution.length > 0 ? solution.join(", ") : "Brak danych"
  },
  default: {
    isMaximization: true,
    solutionLabel: "Najlepsze rozwiązanie",
    scoreLabel: "Najlepszy wynik",
    unit: "",
    icon: "🏆",
    format: (solution) => solution && solution.length > 0 ? solution.join(", ") : "Brak danych"
  }
};


export default function AlgorithmResultPanel({ result, allResults, addPanel }) {
  if (!result) return null;

  const config = problemConfig[result.problemName] || problemConfig.default;

  const dataKeyExists = (key) => {
    return allResults?.[0]?.iterationResults?.[0]?.specificMetrics?.hasOwnProperty(key);
  };
  
  // Zaktualizowana lista przycisków
  const chartButtonsConfig = [
    { type: "charts-score", label: "📈 Jakość Populacji / Trajektoria", key: "bestScore" },
    { type: "charts-time", label: "🕒 Czas iteracji", key: "executionDurationMs" },
    { type: "charts-exploration", label: "🧭 Miara Eksploracji", key: "exploration", isSpecific: true },
    { type: "charts-improvements", label: "🚀 Częstotliwość poprawy", key: "improvements", isSpecific: true },
    { type: "charts-relative-improvement", label: "📊 Skoki Poprawy", key: "relativeImprovement", isSpecific: true },
    { type: "charts-stagnation", label: "⏳ Stagnacja", key: "stagnation", isSpecific: true },
  ];

  return (
    <div className="result-panel result-panel-top">
      <h3>Wynik: {result.algorithmName}</h3>
      {result.success ? (
        <div className="result-content">
          <div className="result-metric">
            <strong>{config.icon} {config.scoreLabel}:</strong>
            <span>{result.bestScore != null ? `${parseFloat(result.bestScore).toFixed(2)} ${config.unit}`.trim() : "Brak danych"}</span>
          </div>
          <div className="result-metric">
            <strong>⏱️ Łączny czas wykonania:</strong>
            <span>{result.executionDurationMs != null ? `${(result.executionDurationMs / 1000).toFixed(3)} s` : "Brak danych"}</span>
          </div>
          <div className="result-metric full-width">
            <strong>{config.icon} {config.solutionLabel}: </strong>
            <span className="solution-path">{config.format(result.bestSolution)}</span>
          </div>

          <div className="result-buttons">
            <div className="result-button-group">
                <button className="result-button single-view" onClick={() => addPanel("table", result)}>📊 Pokaż tabelę iteracji</button>
            </div>
            <div className="result-button-group">
                {chartButtonsConfig.map(btn => {
                  const keyExists = btn.isSpecific ? dataKeyExists(btn.key) : allResults?.[0]?.iterationResults?.[0]?.hasOwnProperty(btn.key);
                  if (keyExists) {
                    return (
                      <button key={btn.type} className="result-button compare-view" onClick={() => addPanel(btn.type, allResults)}>
                        {btn.label}
                      </button>
                    );
                  }
                  return null;
                })}
            </div>
          </div>
        </div>
      ) : (
        <div className="error">
          <p><strong>Wystąpił błąd:</strong> {result.errorMessage || "Nieznany błąd"}</p>
        </div>
      )}
    </div>
  );
}

