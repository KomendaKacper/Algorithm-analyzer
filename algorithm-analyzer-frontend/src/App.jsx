import { useState, useEffect } from "react";
import GraphControls from "./components/GraphControls";
import GraphViewer from "./components/GraphViewer";
import AlgorithmPanel from "./components/AlgorithmPanel";
import { getGraphs, getGraph, generateRandomGraph } from "./api/graphApi";
import { getAlgorithms, executeAlgorithm } from "./api/algorithmApi";
import { useGraphTransform } from "./hooks/useGraphTransform";
import "./App.css";

export default function App() {
  const [graphs, setGraphs] = useState([]);
  const [selectedGraphSummary, setSelectedGraphSummary] = useState(null);
  const [selectedGraphDetails, setSelectedGraphDetails] = useState(null);
  const [algorithms, setAlgorithms] = useState([]);
  const [algorithmResult, setAlgorithmResult] = useState(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);

  // Transform Spring Boot graph data to your existing format
  const transformedGraph = useGraphTransform(selectedGraphDetails);

  useEffect(() => {
    loadGraphs();
    loadAlgorithms();
  }, []);

  useEffect(() => {
    if (selectedGraphSummary) {
      loadGraphDetails(selectedGraphSummary.id);
    }
  }, [selectedGraphSummary]);

  const loadGraphs = async () => {
    try {
      const res = await getGraphs();
      setGraphs(res.data);

      if (res.data.length > 0) {
        setSelectedGraphSummary(res.data[0]);
      }
    } catch (err) {
      console.error("Błąd ładowania grafów:", err);
    }
  };

  const loadGraphDetails = async (graphId) => {
    setIsLoadingGraph(true);
    try {
      const res = await getGraph(graphId);
      setSelectedGraphDetails(res.data);
    } catch (err) {
      console.error("Błąd ładowania szczegółów grafu:", err);
    } finally {
      setIsLoadingGraph(false);
    }
  };

  const loadAlgorithms = async () => {
    try {
      const res = await getAlgorithms();
      setAlgorithms(res.data);
      console.log(algorithms);
    } catch (err) {
      console.error("Błąd ładowania algorytmów:", err);
    }
  };

  const handleSelectGraph = (graph) => {
    setSelectedGraphSummary(graph);
    setAlgorithmResult(null); // Wyczyść poprzednie wyniki
  };

  const handleGenerateRandom = async (graphParams) => {
  try {
    console.log("Payload wysyłany do backendu:", {
  name: graphParams.name || "Losowy graf",
  nodeCount: graphParams.nodeCount,
  edgeProbability: graphParams.edgeProbability,
  directed: graphParams.directed ?? false,
  minWeight: graphParams.minWeight,
  maxWeight: graphParams.maxWeight,
});

    const res = await generateRandomGraph({
      name: graphParams.name || "Losowy graf",
      nodeCount: graphParams.nodeCount,
      edgeProbability: graphParams.edgeProbability,
      directed: graphParams.directed ?? false,
      minWeight: graphParams.minWeight,
      maxWeight: graphParams.maxWeight,
    });

    await loadGraphs();
    setSelectedGraphSummary(res.data);
  } catch (err) {
    console.error("Błąd generowania grafu:", err);
  }
};



  const handleExecuteAlgorithm = async (algorithmName, parameters) => {
    if (!selectedGraphSummary) return;

    try {
      const res = await executeAlgorithm(algorithmName, selectedGraphSummary.id, parameters);
      setAlgorithmResult(res.data);
    } catch (err) {
      console.error("Błąd wykonywania algorytmu:", err);
      setAlgorithmResult({
        success: false,
        errorMessage: err.response?.data?.message || err.message
      });
    }
  };

  return (
    <div className="app-root">
      <div className="app-header">
        <h1 className="text-xl font-bold text-black">
          Algorithm Analyzer
        </h1>
      </div>

      <div className="app-container">
        <div className="controls-panel">
          <GraphControls
            graphs={graphs}
            selectedGraph={selectedGraphSummary}
            onSelectGraph={handleSelectGraph}
            onGenerateRandom={handleGenerateRandom}
          />
          
          <AlgorithmPanel
            algorithms={algorithms}
            selectedGraph={selectedGraphDetails}
            onExecuteAlgorithm={handleExecuteAlgorithm}
            result={algorithmResult}
          />
        </div>

        <div className="graph-container">
          {isLoadingGraph ? (
            <div className="loading-message">
              Ładowanie grafu...
            </div>
          ) : (
            <GraphViewer
              graph={transformedGraph}
              nodeColor="#3498db"
              nodeHighlightColor="#f1c40f"
              nodeStrokeColor="#f1c40f75"
              linkColor="#1a425cff"
              linkHighlightColor="#fff0b6ff"
              highlightPath={algorithmResult?.path || []}
            />
          )}
        </div>
      </div>

      {algorithmResult && (
        <div className="result-panel">
          <h3>Wyniki algorytmu</h3>
          {algorithmResult.success ? (
            <div>
              <p><strong>Ścieżka:</strong> {algorithmResult.path?.join(' → ')}</p>
              <p><strong>Długość:</strong> {algorithmResult.pathLength?.toFixed(2)}</p>
              <p><strong>Czas:</strong> {algorithmResult.executionDurationMs}ms</p>
            </div>
          ) : (
            <p className="error">Błąd: {algorithmResult.errorMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}