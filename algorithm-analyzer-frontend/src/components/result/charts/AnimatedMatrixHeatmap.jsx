import React, { useState } from 'react';
import { MatrixHeatmap } from './MatrixHeatmap';

export function AnimatedMatrixHeatmap({ results }) {
  const [currentIteration, setCurrentIteration] = useState(0);

  // Znajdź pierwszy wynik, który ma dane snapshotów
  const resultWithSnapshots = results.find(r => r.iterationResults?.[0]?.specificMetrics?.pheromoneSnapshot);
  
  if (!resultWithSnapshots) {
    return <div className="chart-placeholder">Brak danych do animacji (pamiętaj, aby włączyć śledzenie feromonów).</div>;
  }
  
  const iterationResults = resultWithSnapshots.iterationResults;
  const maxIterations = iterationResults.length - 1;

  const handleSliderChange = (e) => {
    setCurrentIteration(parseInt(e.target.value, 10));
  };
  
  const snapshotData = iterationResults[currentIteration]?.specificMetrics?.pheromoneSnapshot;

  return (
    <div className="animated-heatmap-wrapper">
      <MatrixHeatmap 
        title={`Rozkład feromonów w iteracji ${currentIteration}`}
        nodes={resultWithSnapshots.nodes}
        matrixData={snapshotData}
      />
      <div className="iteration-slider-container">
        <label htmlFor="iteration-slider">Iteracja: {currentIteration}</label>
        <input
          type="range"
          id="iteration-slider"
          min="0"
          max={maxIterations}
          value={currentIteration}
          onChange={handleSliderChange}
          className="iteration-slider"
        />
      </div>
    </div>
  );
}

