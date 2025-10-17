import { useState, useEffect } from "react";
import { getAlgorithms, executeAlgorithm } from "./api/algorithmApi";

import ControlPanel from "./components/input/ControlPanel";
import DraggablePanels from "./components/result/DraggablePanels";
import AlgorithmOverlay from "./components/result/AlgorithmOverlay";

import "./App.css";

export default function App() {
  const [algorithms, setAlgorithms] = useState([]);
  const [algorithmResult, setAlgorithmResult] = useState(null);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);

  const [openPanels, setOpenPanels] = useState([]);
  const [panelPositions, setPanelPositions] = useState({});

  const [currentTask, setCurrentTask] = useState({
    type: null,
    name: null,
    problemName: null,
    problemParameters: {},
    algorithmParameters: {},
  });

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const res = await getAlgorithms();
        setAlgorithms(res.data);
      } catch (err) {
        console.error("Błąd ładowania algorytmów:", err);
      }
    };
    fetchAlgorithms();
  }, []);

  const handleExecuteCurrentTask = async () => {
    if (!currentTask?.name || !currentTask?.problemName) {
      console.error("Nie można wykonać zadania: brak nazwy algorytmu lub problemu.");
      return;
    }

    setIsAlgorithmRunning(true);
    setAlgorithmResult(null);

    const payload = {
      problemParameters: currentTask.problemParameters,
      algorithmParameters: currentTask.algorithmParameters,
    };

    try {
      const response = await executeAlgorithm(
        currentTask.name,
        currentTask.problemName,
        payload
      );
      setAlgorithmResult(response.data);
    } catch (error) {
      console.error("Błąd wykonania algorytmu:", error);
      const errorData = error.response?.data || { 
        success: false, 
        errorMessage: error.message || "Błąd sieci lub serwera" 
      };
      setAlgorithmResult(errorData);
    } finally {
      setIsAlgorithmRunning(false);
    }
  };

  const addPanel = (type, data) => {
    const id = `${type}-${Date.now()}`;
    setOpenPanels((prev) => [...prev, { id, type, data }]);
    setPanelPositions((prev) => ({
      ...prev,
      [id]: { top: 120 + Object.keys(prev).length * 30, left: 450 + Object.keys(prev).length * 30 },
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
          addPanel={addPanel} // Prop `onShowPheromones` usunięty
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