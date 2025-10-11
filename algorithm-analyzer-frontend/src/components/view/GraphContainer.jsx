// src/components/view/GraphContainer.jsx
import GraphViewer from "./GraphViewer";
import PheromoneControl from "../result/PheromoneControl";

export default function GraphContainer({ 
  graph, 
  algorithmResult, 
  isLoading,
  pheromoneData,
  currentIteration,
  maxIterations,
  onIterationChange,
  showPheromones,
  onClosePheromones
}) {
  return (
    <div className="graph-container">
      {isLoading ? (
        <div className="loading-message">Ładowanie grafu...</div>
      ) : (
        <>
          <GraphViewer
            graph={graph}
            nodeColor="#3498db"
            nodeHighlightColor="#f1c40f"
            nodeStrokeColor="#f1c40f75"
            linkColor="#1a425cff"
            linkHighlightColor="#fff0b6ff"
            highlightPath={algorithmResult?.path || []}
            pheromoneData={pheromoneData}
            showPheromones={showPheromones}
          />
          
          {showPheromones && pheromoneData && maxIterations >= 0 && (
            <>
              <PheromoneControl
                maxIterations={maxIterations}
                currentIteration={currentIteration}
                onIterationChange={onIterationChange}
              />
              
              {/* Przycisk zamknięcia */}
              <button
                onClick={onClosePheromones}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "rgba(231, 76, 60, 0.9)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  zIndex: 101,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.background = "rgba(192, 57, 43, 0.9)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.background = "rgba(231, 76, 60, 0.9)";
                }}
              >
                ✕ Zamknij wizualizację feromonów
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}