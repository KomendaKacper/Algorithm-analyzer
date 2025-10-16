import { useState, useEffect } from "react";
import { getAlgorithms, executeAco } from "./api/algorithmApi";

import ControlPanel from "./components/input/ControlPanel";
import ResultPanelWrapper from "./components/result/ResultPanelWrapper";
import DraggablePanels from "./components/result/DraggablePanels";
import AlgorithmOverlay from "./components/result/AlgorithmOverlay";

import "./App.css";

export default function App() {
  const [algorithms, setAlgorithms] = useState([]);
  const [algorithmResult, setAlgorithmResult] = useState(null);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(true);

  const [currentTask, setCurrentTask] = useState({
    type: null, // "algorithm" lub "problem"
    name: null,
    problemName: null,
    parameters: {},
  });

  const [openPanels, setOpenPanels] = useState([]);
  const [panelPositions, setPanelPositions] = useState({});

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const res = await getAlgorithms();
        setAlgorithms(res.data);
      } catch (err) {
        console.error("Error loading algorithms:", err);
      }
    };
    fetchAlgorithms();
  }, []);

  const handleExecuteCurrentTask = async () => {
    if (!currentTask?.type) return;

    setIsAlgorithmRunning(true);
    setIsResultVisible(false);

    try {
      const res = await executeAco(currentTask.problemName, currentTask.parameters);
      setAlgorithmResult(res.data);
    } catch (err) {
      console.error("Execution error:", err);
      setAlgorithmResult({ success: false, errorMessage: err.message });
    } finally {
      setIsAlgorithmRunning(false);
      setTimeout(() => setIsResultVisible(true), 500);
    }
  };

  const addPanel = (type, data) => {
    const id = Date.now();
    setOpenPanels((prev) => [...prev, { id, type, data }]);
    setPanelPositions((prev) => ({
      ...prev,
      [id]: { top: 120 + Object.keys(prev).length * 30, left: 120 + Object.keys(prev).length * 30 },
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
          algorithms={algorithms}
          algorithmResult={algorithmResult}
          currentTask={currentTask}
          setCurrentTask={setCurrentTask}
          isAlgorithmRunning={isAlgorithmRunning}
          handleExecuteCurrentTask={handleExecuteCurrentTask}
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

      <AlgorithmOverlay isAlgorithmRunning={isAlgorithmRunning} />
    </div>
  );
}
