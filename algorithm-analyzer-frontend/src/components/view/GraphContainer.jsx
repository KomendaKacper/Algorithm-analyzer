// src/components/GraphContainer.jsx
import GraphViewer from "./GraphViewer";

export default function GraphContainer({ graph, algorithmResult, isLoading }) {
  return (
    <div className="graph-container">
      {isLoading ? (
        <div className="loading-message">Ładowanie grafu...</div>
      ) : (
        <GraphViewer
          graph={graph}
          nodeColor="#3498db"
          nodeHighlightColor="#f1c40f"
          nodeStrokeColor="#f1c40f75"
          linkColor="#1a425cff"
          linkHighlightColor="#fff0b6ff"
          highlightPath={algorithmResult?.path || []}
        />
      )}
    </div>
  );
}
