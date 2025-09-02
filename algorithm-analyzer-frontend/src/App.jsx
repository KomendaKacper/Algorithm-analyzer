import { useState, useEffect } from "react";
import GraphControls from "./components/GraphControls";
import GraphViewer from "./components/GraphViewer";
import { getGraphs, generateRandomGraph } from "./api/graphApi";
import "./App.css";

export default function App() {
  const [graphs, setGraphs] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState(null);

  useEffect(() => {
    loadGraphs();
  }, []);

  const loadGraphs = async () => {
    try {
      const res = await getGraphs();
      setGraphs(res.data);

      if (res.data.length > 0) {
        setSelectedGraph(res.data[0]);
      }
    } catch (err) {
      console.error("Błąd ładowania grafów:", err);
    }
  };

  const handleGenerateRandom = async () => {
    try {
      const res = await generateRandomGraph({
        name: "Losowy graf",
        numNodes: 20,
        density: 0.4,
        directed: true,
        maxWeight: 10,
      });

      await loadGraphs();
      setSelectedGraph(res.data);
    } catch (err) {
      console.error("Błąd generowania grafu:", err);
    }
  };

  return (
    <div className="app-root">
      <div className="app-header">
        <h1 className="text-xl font-bold text-white">
          Algorithm Analyzer - Graphs
        </h1>
      </div>

      <div className="app-container">
        <GraphControls
          graphs={graphs}
          selectedGraph={selectedGraph}
          onSelectGraph={(graph) => setSelectedGraph(graph)}
          onGenerateRandom={handleGenerateRandom}
        />
        <div className="graph-container">
          <GraphViewer
            graph={selectedGraph}
            nodeColor="#3498db"
            nodeHighlightColor="#f1c40f"
            nodeStrokeColor="#e67e22"
            linkColor="#1a425cff"
            linkHighlightColor="#5d501aff"
            
          />
        </div>
      </div>
    </div>
  );
}
