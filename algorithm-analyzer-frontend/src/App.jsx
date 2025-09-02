import { useState, useEffect } from "react";
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

      // Load full graph details for first graph if available
      if (res.data.length > 0) {
        const firstGraph = res.data[0];
        setSelectedGraph(firstGraph);
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

      // Reload list of graphs from backend
      await loadGraphs();

      // Select newly generated graph
      setSelectedGraph(res.data);
    } catch (err) {
      console.error("Błąd generowania grafu:", err);
    }
  };

  return (
    <div className="app-root">
      <div className="app-header">
        <h1 className="text-xl font-bold text-white">Algorithm Analyzer - Graphs</h1>
      </div>

      <div className="app-container">
        <div className="controls-container">
          <button
            onClick={handleGenerateRandom}
            className="main-controls bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Generuj losowy graf
          </button>

          <select
            onChange={(e) =>
              setSelectedGraph(graphs.find((g) => g.id === parseInt(e.target.value)))
            }
            value={selectedGraph?.id || ""}
            className="main-controls border rounded px-2 py-1"
          >
            {graphs.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="graph-container">
          <GraphViewer graph={selectedGraph} />
        </div>
      </div>
    </div>
  );
}
