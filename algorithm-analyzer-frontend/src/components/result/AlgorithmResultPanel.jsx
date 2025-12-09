// src/components/result/AlgorithmResultPanel.jsx
import React, { useState } from "react";
import '../../App.css';

const problemConfig = {
  "Traveling Salesman Problem (TSP)": { isMaximization: false, solutionLabel: "Trasa", scoreLabel: "Dystans", unit: "km", icon: "📍", format: (solution) => solution && solution.length > 0 ? `${solution.join(" → ")} → ${solution[0]}` : "Brak danych" },
  "Knapsack Problem": { isMaximization: true, solutionLabel: "Przedmioty", scoreLabel: "Wartość", unit: "", icon: "🎒", format: (solution) => solution && solution.length > 0 ? solution.join(", ") : "Brak danych" },
  default: { isMaximization: true, solutionLabel: "Rozwiązanie", scoreLabel: "Wynik", unit: "", icon: "🏆", format: (solution) => solution && solution.length > 0 ? solution.join(", ") : "Brak danych" }
};

// --- ULEPSZONY FORMATTER (NAPRAWIA ZLANE TEKSTY) ---
const formatMetricValue = (value) => {
    if (value === null || value === undefined) return null;

    if (typeof value === 'number') {
        return Number.isInteger(value) ? value : value.toFixed(4);
    }

    // Obsługa obiektów (np. statystyki feromonów) - tworzy ładne "tagi"
    if (typeof value === 'object' && !Array.isArray(value)) {
        return (
            <div className="nested-metric-tags">
                {Object.entries(value).map(([k, v]) => (
                    <span key={k} className="metric-tag">
                        <span className="tag-label">{k}:</span>
                        <span className="tag-value">
                            {typeof v === 'number' ? v.toFixed(4) : String(v)}
                        </span>
                    </span>
                ))}
            </div>
        );
    }
    return String(value);
};

export default function AlgorithmResultPanel({ result, addPanel, isComparisonMode, isMinimized, toggleMinimize }) {
  const [isSolutionExpanded, setIsSolutionExpanded] = useState(false);

  if (!result) return null;

  const config = problemConfig[result.problemName] || problemConfig.default;
  const hasPheromoneSnapshots = result.iterationResults?.[0]?.specificMetrics?.hasOwnProperty('pheromoneSnapshot');
  const lastIteration = result.iterationResults?.[result.iterationResults.length - 1];

  // Przygotowanie źródła metryk (etykiety z backendu lub klucze z danych)
  let metricsSource = result.specificMetricLabels;
  if (!metricsSource && lastIteration?.specificMetrics) {
      metricsSource = {};
      Object.keys(lastIteration.specificMetrics).forEach(key => {
          // Ignorujemy snapshoty feromonów w wykresach
          if (key !== 'pheromoneSnapshot') {
            // Formatowanie klucza camelCase na tekst (np. pheromoneStats -> Pheromone Stats)
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            metricsSource[key] = label;
          }
      });
  }

  // Filtrowanie metryk do wyświetlenia (tylko te, które mają wartość i nie są macierzami)
  const displayableMetrics = metricsSource 
    ? Object.entries(metricsSource).filter(([key, label]) => {
        // if (result.finalMetrics && result.finalMetrics[key]) return false; // Ukryj jeśli to macierz
        const val = lastIteration?.specificMetrics?.[key];
        return val !== null && val !== undefined; // Ukryj jeśli brak danych (np. feromony w SA)
      })
    : [];

  return (
    <div className={`result-panel ${isMinimized ? "minimized" : ""}`}>
      {/* --- NAGŁÓWEK --- */}
      <div className="result-panel-header">
        <h3 title={result.algorithmName}>{result.algorithmName}</h3>
        <button onClick={toggleMinimize} className="panel-minimize-button">
          {isMinimized ? '⤢' : '—'}
        </button>
      </div>

      {!isMinimized && result.success ? (
        <div className="result-content">
            
          {/* --- SEKCJA 1: GŁÓWNE WYNIKI (Dystans, Czas) --- */}
          <div className="primary-metrics-grid">
              <div className="primary-metric">
                <span className="p-label">{config.icon} {config.scoreLabel}</span>
                <span className="p-value highlight">
                    {result.bestScore != null ? `${parseFloat(result.bestScore).toFixed(2)} ${config.unit}` : "-"}
                </span>
              </div>
              <div className="primary-metric">
                <span className="p-label">⏱️ Czas</span>
                <span className="p-value">
                    {result.executionDurationMs != null ? `${(result.executionDurationMs / 1000).toFixed(3)}s` : "-"}
                </span>
              </div>
          </div>

          {/* --- SEKCJA 2: ROZWIĄZANIE (Ścieżka) --- */}
          <div className="solution-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="p-label small">Najlepsza trasa:</span>
                <button 
                    onClick={() => setIsSolutionExpanded(!isSolutionExpanded)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary-static)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0 4px'
                    }}
                >
                    {isSolutionExpanded ? 'Zwiń' : 'Rozwiń'}
                </button>
            </div>
            <div className={`solution-box ${isSolutionExpanded ? 'expanded' : ''}`}>
                {config.format(result.bestSolution)}
            </div>
          </div>

          {/* --- SEKCJA 3: SZCZEGÓŁOWE METRYKI (Stagnacja, Feromony itp.) --- */}
          {displayableMetrics.length > 0 && (
            <div className="secondary-metrics-box">
              <div className="box-title">📊 Charakterystyka Końcowa</div>
              <div className="metrics-list">
                {displayableMetrics.map(([key, label]) => (
                  <div key={key} className="metric-row">
                    <span className="m-label">{label}:</span>
                    <div className="m-value">{formatMetricValue(lastIteration.specificMetrics[key])}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SEKCJA 4: PRZYCISKI AKCJI (Na samym dole, oddzielone) --- */}
          <div className="actions-section">
            
            {/* Wykresy dynamiczne (specyficzne metryki) - NAD TABELĄ */}
            {displayableMetrics.map(([key, label]) => {
                return (
                    <button key={`chart-${key}`} className="action-btn chart-btn" onClick={() => addPanel(`charts-specific-${key}`, [result])}>
                        📈 {label}
                    </button>
                )
            })}

            {/* Tabela */}
            <button className="action-btn table-btn" onClick={() => addPanel("table", result)}>
               📅 Tabela wyników
            </button>

            {/* Macierze - USUNIĘTE NA ŻYCZENIE */}
            {/* {result.finalMetrics && Object.entries(result.finalMetrics).map(([key, metricData]) => {
                if (key === 'pheromones' && hasPheromoneSnapshots) return null;
                return (
                    <button key={key} className="action-btn matrix-btn" onClick={() => addPanel(`matrix-${key}`, { title: metricData.label, nodes: result.nodes, matrixData: metricData.data })}>
                       🗺️ {metricData.label || key}
                    </button>
                )
            })} */}
            
            {/* Animacja */}
            {hasPheromoneSnapshots && (
                <button className="action-btn anim-btn" onClick={() => addPanel('animated-matrix-pheromones', [result])}>
                  📽️ Animacja
                </button>
            )}

            {/* Wykresy standardowe */}
            {!isComparisonMode && (
                <>
                    <button className="action-btn chart-btn" onClick={() => addPanel("charts-score", [result])}>📈 Zbieżność</button>
                    <button className="action-btn chart-btn" onClick={() => addPanel("charts-stagnation", [result])}>⏳ Stagnacja</button>
                </>
            )}
          </div>

        </div>
      ) : !isMinimized && (
        <div className="result-content error">Błąd: {result.errorMessage}</div>
      )}
    </div>
  );
}