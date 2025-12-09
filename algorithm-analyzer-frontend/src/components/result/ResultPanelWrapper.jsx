// src/components/result/ResultPanelWrapper.jsx
import React from "react";
import AlgorithmResultPanel from "./AlgorithmResultPanel";
import '../../App.css'; 

export default function ResultPanelWrapper({ 
  results, 
  addPanel,
  minimizedPanels,
  toggleMinimizePanel,
  isComparisonMinimized,
  toggleComparisonMinimize
}) {
  if (!results || results.length === 0) return null;

  const isComparison = results.length > 1;
  const hasPheromones = results.some(r => r.iterationResults?.[0]?.specificMetrics?.hasOwnProperty('pheromoneSnapshot'));

  const commonChartButtons = [
    { type: "charts-score", label: "📈 Wykres Zbieżności" },
    { type: "charts-time", label: "🕒 Czas iteracji" },
    { type: "charts-improvements", label: "🚀 Częstotliwość poprawy" },
    { type: "charts-relative-improvement", label: "📊 Skoki Poprawy" },
    { type: "charts-stagnation", label: "⏳ Stagnacja" },
  ];

  return (
    <>
      {/* Panel Porównawczy (Tylko gdy > 1 wynik) */}
      {isComparison && (
        <div className={`result-buttons-wrapper ${isComparisonMinimized ? "minimized" : ""}`}>
          <div className="result-panel-header">
            <h3>Narzędzia Porównawcze</h3>
            <button onClick={toggleComparisonMinimize} className="panel-minimize-button">
              {isComparisonMinimized ? '⤢' : '—'}
            </button>
          </div>
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
            {hasPheromones && (
                <button 
                  className="result-button specific-view" 
                  onClick={() => addPanel('animated-matrix-pheromones', results)}
                >
                  📽️ Porównanie Feromonów
                </button>
            )}
          </div>
        </div>
      )}

      {/* Indywidualne karty wyników */}
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