// src/App.jsx
import { useState, useEffect } from "react";
import GraphControls from "./components/input/GraphControls";
import GraphViewer from "./components/view/GraphViewer";
import AlgorithmPanel from "./components/input/AlgorithmPanel";
import { getGraphs, getGraph, generateRandomGraph } from "./api/graphApi";
import { getAlgorithms, executeAlgorithm } from "./api/algorithmApi";
import { useGraphTransform } from "./hooks/useGraphTransform";
import Shuffle from "./uiComponents/ShuffleHeader.jsx";
import AlgorithmResultPanel from "./components/result/AlgorithmResultPanel.jsx";
import AcoIterationTable from "./components/result/AcoIterationTable.jsx";
import { MetricChart } from "./components/result/charts/MetricChart.jsx";
import { DistanceChart } from "./components/result/charts/DistanceChart.jsx";

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

  const transformedGraph = useGraphTransform(selectedGraphDetails);

  useEffect(() => {
    loadGraphs();
    loadAlgorithms();
  }, []);

  useEffect(() => {
    if (selectedGraphSummary) loadGraphDetails(selectedGraphSummary.id);
  }, [selectedGraphSummary]);

  const loadGraphs = async () => {
    try {
      const res = await getGraphs();
      setGraphs(res.data);
      if (res.data.length > 0) setSelectedGraphSummary(res.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGraphDetails = async (graphId) => {
    setIsLoadingGraph(true);
    try {
      const res = await getGraph(graphId);
      setSelectedGraphDetails(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingGraph(false);
    }
  };

  const loadAlgorithms = async () => {
    try {
      const res = await getAlgorithms();
      setAlgorithms(res.data);
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      setIsResultVisible(true);
    } catch (err) {
      console.error(err);
      setAlgorithmResult({
        success: false,
        errorMessage: err.response?.data?.message || err.message,
      });
      setIsResultVisible(true);
    }
  };

  const addPanel = (type, data) => {
    const id = Date.now();

    // 🔹 Konwersja danych z defensywną obsługą null dla constraintViolations
    const numericData = (data.data || data).map((item) => ({
      ...item,
      bestDistance: Number(item.bestDistance),
      worstDistance: Number(item.worstDistance),
      averageDistance: Number(item.averageDistance),
      executionDurationMs: Number(item.executionDurationMs),
      gap: item.gap != null ? Number(item.gap) : undefined,
      constraintViolations:
        item.constraintViolations != null ? Number(item.constraintViolations) : 0,
      diversity: Number(item.diversity),
      stagnation: Number(item.stagnation),
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

  const startDrag = (e, id) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const pos = panelPositions[id] || { top: 100, left: 100 };

    const onMouseMove = (moveEvent) => {
      const newTop = pos.top + (moveEvent.clientY - startY);
      const newLeft = pos.left + (moveEvent.clientX - startX);
      setPanelPositions((prev) => ({
        ...prev,
        [id]: { top: newTop, left: newLeft },
      }));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="app-root">
      <div className="app-container">
        <div className="controls-panel">
          <Shuffle
            text="Algorithm Analyzer"
            shuffleDirection="right"
            duration={3}
          />
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

        {isResultVisible && (
          <AlgorithmResultPanel result={algorithmResult} addPanel={addPanel} />
        )}
      </div>

      {/* 🔹 Draggable Panels */}
      {openPanels.map((panel) => {
        const pos = panelPositions[panel.id] || {};
        return (
          <div
            key={panel.id}
            className={`draggable-panel ${
              panel.type.startsWith("charts") ? "panel-charts" : "panel-table"
            }`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className="panel-header"
              onMouseDown={(e) => startDrag(e, panel.id)}
            >
              <span className="panel-title">
                {panel.type === "table" && "Tabela iteracji"}
                {panel.type === "charts-distance" && "Wykres dystansów"}
                {panel.type === "charts-time" && "Wykres czasu"}
                {panel.type === "charts-gap" && "Różnica"}
                {panel.type === "charts-violations" && "Naruszenia ograniczeń"}
                {panel.type === "charts-diversity" && "Różnorodność [%]"}
                {panel.type === "charts-stagnation" && "Zastój iteracji"}
              </span>
              <button
                className="panel-close-btn"
                onClick={() => removePanel(panel.id)}
              >
                ✕
              </button>
            </div>
            <div className="panel-content">
              {panel.type === "table" && (
                <AcoIterationTable data={panel.data.data || panel.data} />
              )}
              {panel.type === "charts-distance" && (
                <DistanceChart
                  data={panel.data.data || panel.data}
                  algorithmName={panel.data.algorithmName || "ACO"}
                  showAverage={false} // 🔹 usuwa średnią
                />
              )}
              {panel.type === "charts-time" && (
                <MetricChart
                  data={panel.data.data}
                  dataKey="executionDurationMs"
                  name="Czas [ms]"
                  color="#3498DB"
                  trendColor="#2ECC71"
                  algorithmName={panel.data.algorithmName || "ACO"}
                  showTrend={true}
                />
              )}
              {panel.type === "charts-gap" && (
                <MetricChart
                  data={panel.data.data}
                  dataKey="gap"
                  name="Różnica"
                  color="#9C27B0"
                  trendColor="#E91E63"
                  algorithmName={panel.data.algorithmName || "ACO"}
                  showTrend={true}
                />
              )}
              {panel.type === "charts-violations" && (
                <MetricChart
                  data={panel.data.data}
                  dataKey="constraintViolations"
                  name="Naruszenia ograniczeń"
                  color="#FF9800"
                  trendColor="#FFB74D"
                  algorithmName={panel.data.algorithmName || "ACO"}
                  showTrend={true}
                />
              )}
              {panel.type === "charts-diversity" && (
                <MetricChart
                  data={panel.data.data}
                  dataKey="diversity"
                  name="Różnorodność [%]"
                  color="#3F51B5"
                  trendColor="#7986CB"
                  algorithmName={panel.data.algorithmName || "ACO"}
                  showTrend={true}
                />
              )}
              {panel.type === "charts-stagnation" && (
                <MetricChart
                  data={panel.data.data}
                  dataKey="stagnation"
                  name="Zastój iteracji"
                  color="#E91E63"
                  trendColor="#F06292"
                  algorithmName={panel.data.algorithmName || "ACO"}
                  showTrend={true}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
