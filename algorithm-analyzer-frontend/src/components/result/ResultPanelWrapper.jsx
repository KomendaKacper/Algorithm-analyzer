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

  const hasPheromoneSnapshots = results.some(r => 
    r.iterationResults?.[0]?.specificMetrics?.hasOwnProperty('pheromoneSnapshot')
  );

  const commonChartButtons = [
    { type: "charts-score", label: "📈 Wykres Zbieżności Wyniku" },
    { type: "charts-time", label: "🕒 Czas iteracji" },
    { type: "charts-improvements", label: "🚀 Częstotliwość poprawy" },
    { type: "charts-relative-improvement", label: "📊 Skoki Poprawy" },
    { type: "charts-stagnation", label: "⏳ Stagnacja" },
  ];

  return (
    <>
      {/* Sekcja przycisków porównawczych - renderuje się tylko w trybie porównania */}
      {isComparison && (
        <div className={`result-buttons-wrapper ${isComparisonMinimized ? "minimized" : ""}`}>
          <div className="result-panel-header">
            <h3>Wykresy Porównawcze</h3>
            <button onClick={toggleComparisonMinimize} className="panel-minimize-button" title={isComparisonMinimized ? "Rozwiń" : "Zwiń"}>
              {isComparisonMinimized ? '⤢' : '—'}
            </button>
          </div>
          {/* CSS ukryje ten div, jeśli panel jest zwinięty */}
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
            {hasPheromoneSnapshots && (
                <button 
                  className="result-button specific-view" 
                  onClick={() => addPanel('animated-matrix-pheromones', results)}
                >
                  📽️ Ewolucja Feromonów
                </button>
            )}
          </div>
        </div>
      )}

      {/* Ten wrapper jest renderowany ZAWSZE, a panele wewnątrz same się minimalizują */}
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