import { useState } from "react";
import AlgorithmResultPanel from "./AlgorithmResultPanel";
import '../../App.css'; 

export default function ResultPanelWrapper({ results, addPanel }) {
  if (!results || results.length === 0) return null;

  const [minimizedPanels, setMinimizedPanels] = useState({});
  // --- NOWY STAN: Minimalizacja panelu porównawczego ---
  const [isComparisonMinimized, setIsComparisonMinimized] = useState(false);

  const toggleMinimizePanel = (panelId) => {
    setMinimizedPanels(prev => ({ ...prev, [panelId]: !prev[panelId] }));
  };

  const dataKeyExists = (key, isSpecific) => {
    const firstResult = results[0];
    if (!firstResult?.iterationResults?.[0]) return false;
    if (isSpecific) return firstResult.iterationResults[0].specificMetrics?.hasOwnProperty(key);
    return firstResult.iterationResults[0].hasOwnProperty(key);
  };
  
  const chartButtonsConfig = [
    { type: "charts-score", label: "📈 Jakość / Trajektoria", key: "bestScore", isSpecific: false },
    { type: "charts-time", label: "🕒 Czas iteracji", key: "executionDurationMs", isSpecific: false },
    { type: "charts-exploration", label: "🧭 Miara Eksploracji", key: "exploration", isSpecific: true },
    { type: "charts-improvements", label: "🚀 Częstotliwość poprawy", key: "improvements", isSpecific: true },
    { type: "charts-relative-improvement", label: "📊 Skoki Poprawy", key: "relativeImprovement", isSpecific: true },
    { type: "charts-stagnation", label: "⏳ Stagnacja", key: "stagnation", isSpecific: true },
  ];

  const isComparison = results.length > 1;

  return (
    <>
      {isComparison && (
        // --- ZMIANA: Dynamiczna klasa dla zminimalizowanego panelu ---
        <div className={`result-buttons-wrapper ${isComparisonMinimized ? "minimized" : ""}`}>
          {/* --- ZMIANA: Ujednolicony nagłówek z przyciskiem --- */}
          <div className="result-panel-header">
            <h3>Wykresy Porównawcze</h3>
            <button onClick={() => setIsComparisonMinimized(p => !p)} className="panel-minimize-button" title={isComparisonMinimized ? "Rozwiń" : "Zwiń"}>
              {isComparisonMinimized ? '⤢' : '—'}
            </button>
          </div>
          {/* --- ZMIANA: Treść renderowana warunkowo --- */}
          {!isComparisonMinimized && (
            <div className="result-buttons">
              {chartButtonsConfig.map(btn => {
                if (dataKeyExists(btn.key, btn.isSpecific)) {
                  return (
                    <button key={btn.type} className="result-button compare-view" onClick={() => addPanel(btn.type, results)}>
                      {btn.label}
                    </button>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      )}

      <div className="result-wrapper">
        {results.map((result, index) => (
          <AlgorithmResultPanel 
            key={result.algorithmName || index}
            result={result} 
            addPanel={addPanel}
            allResults={results}
            isComparisonMode={isComparison}
            isMinimized={minimizedPanels[result.algorithmName]}
            toggleMinimize={() => toggleMinimizePanel(result.algorithmName)}
          />
        ))}
      </div>
    </>
  );
}

