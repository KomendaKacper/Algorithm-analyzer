import { useState, useEffect } from "react";
import { getGraphs, getGraph, generateRandomGraph } from "./api/graphApi";
import { getAlgorithms, executeAlgorithm } from "./api/algorithmApi";
import { useGraphTransform } from "./hooks/useGraphTransform";

import ControlPanel from "./components/input/ControlPanel";
import GraphContainer from "./components/view/GraphContainer";
import ResultPanelWrapper from "./components/result/ResultPanelWrapper";
import DraggablePanels from "./components/result/DraggablePanels";
import AlgorithmOverlay from "./components/result/AlgorithmOverlay";

import "./App.css";

export default function App() {
  const [graphs, setGraphs] = useState([]);
  const [selectedGraphSummary, setSelectedGraphSummary] = useState(null);
  const [selectedGraphDetails, setSelectedGraphDetails] = useState(null);
  const [algorithms, setAlgorithms] = useState([]);
  const [algorithmResult, setAlgorithmResult] = useState(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [openPanels, setOpenPanels] = useState([]);
  const [panelPositions, setPanelPositions] = useState({});
  const [isResultVisible, setIsResultVisible] = useState(true);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  const [showFallingText, setShowFallingText] = useState(false);

  const transformedGraph = useGraphTransform(selectedGraphDetails);

  // 🔹 Fetch graphs and algorithms on mount
  useEffect(() => {
    const fetchData = async () => {
      await loadGraphs();
      await loadAlgorithms();
    };
    fetchData();
  }, []);

  // 🔹 Load details when selected graph changes
  useEffect(() => {
    if (selectedGraphSummary) loadGraphDetails(selectedGraphSummary.id);
  }, [selectedGraphSummary]);

  // 🔹 API functions
  const loadGraphs = async () => {
    try {
      const res = await getGraphs();
      setGraphs(res.data);
      if (res.data.length > 0 && !selectedGraphSummary)
        setSelectedGraphSummary(res.data[0]);
    } catch (err) {
      console.error("Error loading graphs:", err);
    }
  };

  const loadGraphDetails = async (graphId) => {
    setIsLoadingGraph(true);
    try {
      const res = await getGraph(graphId);
      setSelectedGraphDetails(res.data);
    } catch (err) {
      console.error("Error loading graph details:", err);
    } finally {
      setIsLoadingGraph(false);
    }
  };

  const loadAlgorithms = async () => {
    try {
      const res = await getAlgorithms();
      setAlgorithms(res.data);
    } catch (err) {
      console.error("Error loading algorithms:", err);
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
      console.error("Error generating random graph:", err);
    }
  };

  const handleExecuteAlgorithm = async (algorithmName, parameters) => {
    if (!selectedGraphSummary) return;

    setIsAlgorithmRunning(true);
    setShowFallingText(false);

    try {
      const res = await executeAlgorithm(
        algorithmName,
        selectedGraphSummary.id,
        parameters
      );
      setAlgorithmResult(res.data);
      setIsResultVisible(true);
    } catch (err) {
      console.error("Algorithm execution error:", err);
      setAlgorithmResult({ success: false, errorMessage: err.message });
      setIsResultVisible(true);
    } finally {
      setShowFallingText(true);
      setTimeout(() => setIsAlgorithmRunning(false), 4000);
    }
  };

  const addPanel = (type, data) => {
    const id = Date.now();

    // 🔹 konwersja danych
    const numericData = (data.data || data).map((item) => ({
      ...item,
      bestDistance: Number(item.bestDistance ?? 0),
      worstDistance: Number(item.worstDistance ?? 0),
      averageDistance: Number(item.averageDistance ?? 0),
      executionDurationMs: Number(item.executionDurationMs ?? 0),
      gap: Number(item.gap ?? 0),
      constraintViolations: Number(item.constraintViolations ?? 0),
      diversity: Number(item.diversity ?? 0),
      stagnation: Number(item.stagnation ?? 0),
    }));

    setOpenPanels((prev) => [
      ...prev,
      { id, type, data: { ...data, data: numericData } },
    ]);

    setPanelPositions((prev) => ({
      ...prev,
      [id]: {
        top: 120 + Object.keys(prev).length * 30,
        left: 120 + Object.keys(prev).length * 30,
      },
    }));
  };

  const removePanel = (id) => {
    setOpenPanels((prev) => prev.filter((p) => p.id !== id));
    setPanelPositions((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className="app-root">
      <div className="app-container">
        <ControlPanel
          graphs={graphs}
          selectedGraphSummary={selectedGraphSummary}
          handleSelectGraph={handleSelectGraph}
          handleGenerateRandom={handleGenerateRandom}
          algorithms={algorithms}
          selectedGraphDetails={selectedGraphDetails}
          handleExecuteAlgorithm={handleExecuteAlgorithm}
          algorithmResult={algorithmResult}
        />

        <GraphContainer
          graph={transformedGraph}
          algorithmResult={algorithmResult}
          isLoading={isLoadingGraph}
        />

        <ResultPanelWrapper
          algorithmResult={algorithmResult}
          isResultVisible={isResultVisible}
          setIsResultVisible={setIsResultVisible}
          addPanel={addPanel}
        />
      </div>

      <DraggablePanels
        openPanels={openPanels}
        panelPositions={panelPositions}
        setPanelPositions={setPanelPositions}
        removePanel={removePanel}
      />

      <AlgorithmOverlay
        isAlgorithmRunning={isAlgorithmRunning}
        showFallingText={showFallingText}
      />
    </div>
  );
}
