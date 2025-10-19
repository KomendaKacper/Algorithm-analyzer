import { useState } from "react";
import AlgorithmResultPanel from "./AlgorithmResultPanel";
import '../../App.css'; 

export default function ResultPanelWrapper({ results, addPanel }) {
  if (!results || results.length === 0) return null;

  const [minimizedPanels, setMinimizedPanels] = useState({});
  const [isComparisonMinimized, setIsComparisonMinimized] = useState(false);

  const toggleMinimizePanel = (panelId) => {
    setMinimizedPanels(prev => ({ ...prev, [panelId]: !prev[panelId] }));
  };
  
  // --- ZMIANA: Sprawdzamy, czy którykolwiek z wyników ma snapshoty feromonów ---
  const hasPheromoneSnapshots = results.some(r => 
    r.iterationResults?.[0]?.specificMetrics?.hasOwnProperty('pheromoneSnapshot')
  );

  const isComparison = results.length > 1;

  const commonChartButtons = [
    { type: "charts-score", label: "📈 Jakość / Trajektoria" },
    { type: "charts-time", label: "🕒 Czas iteracji" },
    { type: "charts-exploration", label: "🧭 Miara Eksploracji" },
    { type: "charts-improvements", label: "🚀 Częstotliwość poprawy" },
    { type: "charts-relative-improvement", label: "📊 Skoki Poprawy" },
    { type: "charts-stagnation", label: "⏳ Stagnacja" },
  ];

  return (
    <>
      {isComparison && (
        <div className={`result-buttons-wrapper ${isComparisonMinimized ? "minimized" : ""}`}>
          <div className="result-panel-header">
            <h3>Wykresy Porównawcze</h3>
            <button onClick={() => setIsComparisonMinimized(p => !p)} className="panel-minimize-button" title={isComparisonMinimized ? "Rozwiń" : "Zwiń"}>
              {isComparisonMinimized ? '⤢' : '—'}
            </button>
          </div>
          {!isComparisonMinimized && (
            <div className="result-buttons">
              {commonChartButtons.map(btn => (
                <button 
                  key={btn.type} 
                  className="result-button compare-view" 
                  onClick={() => addPanel(btn.type, results)}
                >
                  {btn.label}
                </button>
              ))}
              {/* --- NOWY PRZYCISK: Animowana macierz feromonów --- */}
              {hasPheromoneSnapshots && (
                 <button 
                    className="result-button specific-view" 
                    onClick={() => addPanel('animated-matrix-pheromones', results)}
                  >
                    📽️ Ewolucja Feromonów
                  </button>
              )}
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
            isComparisonMode={isComparison}
            isMinimized={minimizedPanels[result.algorithmName]}
            toggleMinimize={() => toggleMinimizePanel(result.algorithmName)}
          />
        ))}
      </div>
    </>
  );
}

