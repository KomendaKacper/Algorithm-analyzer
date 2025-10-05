import { useState, useEffect } from "react";
import GraphControls from "./components/GraphControls";
import GraphViewer from "./components/GraphViewer";
import AlgorithmPanel from "./components/AlgorithmPanel";
import { getGraphs, getGraph, generateRandomGraph } from "./api/graphApi";
import { getAlgorithms, executeAlgorithm } from "./api/algorithmApi";
import { useGraphTransform } from "./hooks/useGraphTransform";
import Shuffle from "./uiComponents/ShuffleHeader.jsx";
import AlgorithmResultPanel from "./components/AlgorithmResultPanel.jsx";

export default function App() {
  const [graphs, setGraphs] = useState([]);
  const [selectedGraphSummary, setSelectedGraphSummary] = useState(null);
  const [selectedGraphDetails, setSelectedGraphDetails] = useState(null);
  const [algorithms, setAlgorithms] = useState([]);
  const [algorithmResult, setAlgorithmResult] = useState(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);

  // 🔽 nowy stan widoczności panelu
  const [isResultVisible, setIsResultVisible] = useState(true);

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
    } catch (err) {
      console.error("Błąd ładowania algorytmów:", err);
    }
  };

  const handleSelectGraph = (graph) => {
    setSelectedGraphSummary(graph);
    setAlgorithmResult(null);
  };

  const handleGenerateRandom = async (graphParams) => {
    try {
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
      const res = await executeAlgorithm(
        algorithmName,
        selectedGraphSummary.id,
        parameters
      );
      setAlgorithmResult(res.data);
      setIsResultVisible(true); // 🔽 automatycznie pokaż po obliczeniu
    } catch (err) {
      console.error("Błąd wykonywania algorytmu:", err);
      setAlgorithmResult({
        success: false,
        errorMessage: err.response?.data?.message || err.message,
      });
      setIsResultVisible(true);
    }
  };

  return (
    <div className="app-root">
      <div className="app-container">
        <div className="controls-panel">
          <div className="header-container">
            <Shuffle
              text="Algorithm Analyzer"
              shuffleDirection="right"
              duration={3}
              animationMode="random"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.03}
              threshold={0.1}
              triggerOnce={false}
              triggerOnHover={false}
              respectReducedMotion={true}
            />
          </div>

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
            <div className="loading-message">Ładowanie grafu...</div>
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

        {/* 🔽 przycisk rozwijania/zwijania */}
        {algorithmResult && (
          <div className="result-toggle">
          <button
            onClick={() => setIsResultVisible(!isResultVisible)}
            className="toggle-button"
          >
            {isResultVisible ? "▲ Ukryj wynik" : "▼ Pokaż wynik"}
          </button>
        </div>
        )}
        

        {/* 🔽 sekcja wyniku, chowana/rozwijana */}
        {isResultVisible && <AlgorithmResultPanel result={algorithmResult} />}
      </div>
    </div>
  );
}
