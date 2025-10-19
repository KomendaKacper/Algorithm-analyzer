import React from "react";
import '../../App.css'; 

const problemConfig = {
  "Traveling Salesman Problem (TSP)": { isMaximization: false, solutionLabel: "Najlepsza znaleziona trasa", scoreLabel: "Najlepszy wynik (dystans)", unit: "km", icon: "📍", format: (solution) => solution && solution.length > 0 ? `${solution.join(" → ")} → ${solution[0]}` : "Brak danych" },
  "Knapsack Problem": { isMaximization: true, solutionLabel: "Przedmioty w plecaku", scoreLabel: "Najlepszy wynik (wartość)", unit: "", icon: "🎒", format: (solution) => solution && solution.length > 0 ? solution.join(", ") : "Brak danych" },
  default: { isMaximization: true, solutionLabel: "Najlepsze rozwiązanie", scoreLabel: "Najlepszy wynik", unit: "", icon: "🏆", format: (solution) => solution && solution.length > 0 ? solution.join(", ") : "Brak danych" }
};

const formatMetricValue = (value) => {
    if (value == null) return "Brak danych";
    if (typeof value === 'number') {
        if (Number.isInteger(value)) return value;
        return value.toFixed(3);
    }
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([k, v]) => `${k}: ${formatMetricValue(v)}`)
            .join(' | ');
    }
    return String(value);
};

export default function AlgorithmResultPanel({ result, addPanel, isComparisonMode, isMinimized, toggleMinimize }) {
  if (!result) return null;

  const config = problemConfig[result.problemName] || problemConfig.default;
  
  const commonChartButtons = [
    { type: "charts-score", label: "📈 Jakość / Trajektoria" },
    { type: "charts-time", label: "🕒 Czas iteracji" },
    { type: "charts-exploration", label: "🧭 Miara Eksploracji" },
    { type: "charts-improvements", label: "🚀 Częstotliwość poprawy" },
    { type: "charts-relative-improvement", label: "📊 Skoki Poprawy" },
    { type: "charts-stagnation", label: "⏳ Stagnacja" },
  ];
  
  const lastIteration = result.iterationResults?.[result.iterationResults.length - 1];

  return (
    <div className={`result-panel ${isMinimized ? "minimized" : ""}`}>
      <div className="result-panel-header">
        <h3>Wynik: {result.algorithmName}</h3>
        <button onClick={toggleMinimize} className="panel-minimize-button" title={isMinimized ? "Rozwiń" : "Zwiń"}>
          {isMinimized ? '⤢' : '—'}
        </button>
      </div>

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
          
          {result.specificMetricLabels && lastIteration && (
            <div className="result-metric full-width specific-metrics-summary">
              <strong>Charakterystyka Końcowa:</strong>
              <div className="specific-metrics-grid">
                {Object.entries(result.specificMetricLabels).map(([key, label]) => (
                  <div key={key} className="specific-metric-item">
                    <span>{label}:</span>
                    <strong>{formatMetricValue(lastIteration.specificMetrics?.[key])}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="result-buttons">
            <button className="result-button single-view" onClick={() => addPanel("table", result)}>
              📊 Pokaż tabelę iteracji
            </button>
            
            {/* --- ZMIENIONA LOGIKA: Dynamiczne przyciski dla macierzy --- */}
            {result.finalMetrics && Object.entries(result.finalMetrics).map(([key, metricData]) => (
                <button 
                  key={key} 
                  className="result-button specific-view" 
                  onClick={() => addPanel(`matrix-${key}`, {
                      title: metricData.label || `Macierz ${key}`,
                      nodes: result.nodes,
                      matrixData: metricData.data
                  })}
                >
                  {metricData.label || `Macierz ${key}`}
                </button>
            ))}

            {!isComparisonMode && (
              <>
                {commonChartButtons.map(btn => (
                   <button key={btn.type} className="result-button compare-view" onClick={() => addPanel(btn.type, [result])}>
                     {btn.label}
                   </button>
                ))}
                {result.specificMetricLabels && Object.entries(result.specificMetricLabels).map(([key, label]) => (
                  <button key={key} className="result-button specific-view" onClick={() => addPanel(`charts-specific-${key}`, [result])}>
                    {label}
                  </button>
                ))}
              </>
            )}
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

