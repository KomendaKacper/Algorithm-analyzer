import { useState, useEffect } from "react";
import { getAlgorithms, executeComparison } from "./api/algorithmApi";

import ControlPanel from "./components/input/ControlPanel";
import DraggablePanels from "./components/result/DraggablePanels";
import AlgorithmOverlay from "./components/result/AlgorithmOverlay";
import "./App.css";

export default function App() {
  const [algorithms, setAlgorithms] = useState([]);
  const [results, setResults] = useState([]); // Zmienione na tablicę wyników
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  
  // Stan dla pojedynczej konfiguracji problemu
  const [problemConfig, setProblemConfig] = useState({ name: null, parameters: {} });
  // Stan dla listy skonfigurowanych algorytmów
  const [tasks, setTasks] = useState([]);

  const [openPanels, setOpenPanels] = useState([]);
  const [panelPositions, setPanelPositions] = useState({});

  useEffect(() => {
    getAlgorithms().then(res => setAlgorithms(res.data)).catch(err => console.error("Błąd ładowania algorytmów:", err));
  }, []);

  const handleExecuteCurrentTask = async () => {
    if (!problemConfig.name || tasks.length === 0) {
      console.error("Nie można wykonać zadania: brak problemu lub skonfigurowanych algorytmów.");
      return;
    }

    setIsAlgorithmRunning(true);
    setResults([]);

    const payload = {
      problemParameters: problemConfig.parameters,
      algorithms: tasks.map(task => ({
        name: task.name,
        parameters: task.algorithmParameters,
      })),
    };

    try {
      const response = await executeComparison(problemConfig.name, payload);
      setResults(response.data);
    } catch (error) {
      console.error("Błąd wykonania porównania:", error);
      const errorResult = { success: false, errorMessage: error.message || "Błąd sieci" };
      setResults([errorResult]);
    } finally {
      setIsAlgorithmRunning(false);
    }
  };

  const addPanel = (type, data) => {
    const id = `${type}-${Date.now()}`;
    setOpenPanels(prev => [...prev, { id, type, data }]);
    setPanelPositions(prev => ({
      ...prev,
      [id]: { top: 120 + Object.keys(prev).length * 30, left: 450 + Object.keys(prev).length * 30 },
    }));
  };

  const removePanel = (id) => {
    setOpenPanels(prev => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="app-root">
      <div className="app-container">
        <ControlPanel
          algorithms={algorithms}
          results={results}
          tasks={tasks}
          setTasks={setTasks}
          problemConfig={problemConfig}
          setProblemConfig={setProblemConfig}
          isAlgorithmRunning={isAlgorithmRunning}
          handleExecuteCurrentTask={handleExecuteCurrentTask}
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