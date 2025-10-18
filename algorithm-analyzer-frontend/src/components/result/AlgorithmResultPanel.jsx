import React from "react";
import '../../App.css'; 

const problemConfig = {
  "Traveling Salesman Problem (TSP)": { isMaximization: false, solutionLabel: "Najlepsza znaleziona trasa", scoreLabel: "Najlepszy wynik (dystans)", unit: "km", icon: "📍", format: (solution) => solution && solution.length > 0 ? `${solution.join(" → ")} → ${solution[0]}` : "Brak danych" },
  "Knapsack Problem": { isMaximization: true, solutionLabel: "Przedmioty w plecaku", scoreLabel: "Najlepszy wynik (wartość)", unit: "", icon: "🎒", format: (solution) => solution && solution.length > 0 ? solution.join(", ") : "Brak danych" },
  default: { isMaximization: true, solutionLabel: "Najlepsze rozwiązanie", scoreLabel: "Najlepszy wynik", unit: "", icon: "🏆", format: (solution) => solution && solution.length > 0 ? solution.join(", ") : "Brak danych" }
};

// --- ZMIANA: Komponent akceptuje nowe propsy 'isMinimized' i 'toggleMinimize' ---
export default function AlgorithmResultPanel({ result, addPanel, allResults, isComparisonMode, isMinimized, toggleMinimize }) {
  if (!result) return null;

  const config = problemConfig[result.problemName] || problemConfig.default;
  
  const chartButtonsConfig = [
    { type: "charts-score", label: "📈 Wykres Wyników", key: "bestScore", isSpecific: false },
    { type: "charts-time", label: "🕒 Wykres Czasu", key: "executionDurationMs", isSpecific: false },
    { type: "charts-exploration", label: "🧭 Wykres Eksploracji", key: "exploration", isSpecific: true },
    { type: "charts-improvements", label: "🚀 Wykres Poprawy", key: "improvements", isSpecific: true },
    { type: "charts-relative-improvement", label: "📊 Wykres Skoków", key: "relativeImprovement", isSpecific: true },
    { type: "charts-stagnation", label: "⏳ Wykres Stagnacji", key: "stagnation", isSpecific: true },
  ];

  const dataKeyExists = (key, isSpecific) => {
    if (!result?.iterationResults?.[0]) return false;
    if (isSpecific) {
      return result.iterationResults[0].specificMetrics?.hasOwnProperty(key);
    }
    return result.iterationResults[0].hasOwnProperty(key);
  };

  return (
    // --- ZMIANA: Dynamiczna klasa dla zminimalizowanego panelu ---
    <div className={`result-panel ${isMinimized ? "minimized" : ""}`}>
      {/* --- ZMIANA: Nagłówek teraz zawiera przycisk minimalizacji --- */}
      <div className="result-panel-header">
        <h3>Wynik: {result.algorithmName}</h3>
        <button onClick={toggleMinimize} className="panel-minimize-button" title={isMinimized ? "Rozwiń" : "Zwiń"}>
          {isMinimized ? '⤢' : '—'}
        </button>
      </div>

      {/* --- ZMIANA: Treść renderowana warunkowo dla płynnej animacji (można też przez CSS) --- */}
      {!isMinimized && result.success ? (
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
            <button className="result-button single-view" onClick={() => addPanel("table", result)}>
              📊 Pokaż tabelę iteracji
            </button>
            {!isComparisonMode && chartButtonsConfig.map(btn => {
              if (dataKeyExists(btn.key, btn.isSpecific)) {
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
      ) : !isMinimized && (
        <div className="result-content error">
          <p><strong>Wystąpił błąd:</strong> {result.errorMessage || "Nieznany błąd"}</p>
        </div>
      )}
    </div>
  );
}

