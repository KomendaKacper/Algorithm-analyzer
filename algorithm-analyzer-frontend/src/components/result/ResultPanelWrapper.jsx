// src/components/result/ResultPanelWrapper.jsx

import AlgorithmResultPanel from "./AlgorithmResultPanel";
import '../../App.css'; // Dodajemy styl

export default function ResultPanelWrapper({
  algorithmResult,
  isResultVisible,
  setIsResultVisible,
  addPanel,
  onShowPheromones,
}) {
  if (!algorithmResult) return null;

  return (
    <div className="result-wrapper">
      <div className="result-toggle">
        <button
          onClick={() => setIsResultVisible(!isResultVisible)}
          className="toggle-button"
        >
          {isResultVisible ? "▲ Ukryj podsumowanie" : "▼ Pokaż podsumowanie"}
        </button>
      </div>

      {isResultVisible && (
        <AlgorithmResultPanel 
          result={algorithmResult} 
          addPanel={addPanel}
          onShowPheromones={onShowPheromones}
        />
      )}
    </div>
  );
}