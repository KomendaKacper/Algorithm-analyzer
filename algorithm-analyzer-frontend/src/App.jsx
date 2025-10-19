import { useState, useEffect } from "react";
import { getAlgorithms, executeComparison } from "./api/algorithmApi";

import ControlPanel from "./components/input/ControlPanel";
import DraggablePanels from "./components/result/DraggablePanels";
import AlgorithmOverlay from "./components/result/AlgorithmOverlay";
import ResultPanelWrapper from "./components/result/ResultPanelWrapper";
import "./App.css";

export default function App() {
  const [algorithms, setAlgorithms] = useState([]);
  const [results, setResults] = useState([]);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  
  const [problemConfig, setProblemConfig] = useState({ name: null, parameters: {} });
  // --- ZMIANA: Inicjalizujemy stan z jednym panelem konfiguracyjnym ---
  const [tasks, setTasks] = useState([{}]);

  const [openPanels, setOpenPanels] = useState([]);
  const [panelPositions, setPanelPositions] = useState({});

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    getAlgorithms().then(res => setAlgorithms(res.data)).catch(err => console.error("Błąd ładowania algorytmów:", err));
  }, []);

  const handleExecuteCurrentTask = async () => {
    if (!problemConfig.name || tasks.length === 0 || tasks.some(t => !t || !t.name)) {
      const errorResult = { success: false, errorMessage: "Upewnij się, że problem oraz wszystkie algorytmy są w pełni skonfigurowane." };
      setResults([errorResult]);
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
      const errorResult = { success: false, errorMessage: error.response?.data?.errorMessage || error.message || "Błąd sieci" };
      setResults([errorResult]);
    } finally {
      setIsAlgorithmRunning(false);
    }
  };
  
  const addPanel = (type, data) => {
    const id = `${type}-${Date.now()}`;
    setOpenPanels(prev => [...prev, { id, type, data, minimized: false }]);
    const panelStartLeft = isSidebarCollapsed ? 80 : 450;
    setPanelPositions(prev => ({
      ...prev,
      [id]: { top: 120 + Object.keys(prev).length * 30, left: panelStartLeft + Object.keys(prev).length * 30 },
    }));
  };

  const removePanel = (id) => {
    setOpenPanels(prev => prev.filter((p) => p.id !== id));
  };

  const togglePanelMinimize = (id) => {
    setOpenPanels(prev => 
      prev.map(p => (p.id === id ? { ...p, minimized: !p.minimized } : p))
    );
  };

  return (
    <div className={`App ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className="sidebar">
            <ControlPanel
              algorithms={algorithms}
              tasks={tasks}
              setTasks={setTasks}
              problemConfig={problemConfig}
              setProblemConfig={setProblemConfig}
              isAlgorithmRunning={isAlgorithmRunning}
              handleExecuteCurrentTask={handleExecuteCurrentTask}
            />
            <button 
              className="sidebar-toggle" 
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              title={isSidebarCollapsed ? "Rozwiń panel" : "Zwiń panel"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
        </div>
        <div className="main-content">
            {results.length > 0 && (
              <ResultPanelWrapper 
                results={results} 
                addPanel={addPanel} 
              />
            )}

            <DraggablePanels
              openPanels={openPanels}
              panelPositions={panelPositions}
              setPanelPositions={setPanelPositions}
              removePanel={removePanel}
              toggleMinimize={togglePanelMinimize}
            />
        </div>
      <AlgorithmOverlay isAlgorithmRunning={isAlgorithmRunning} />
    </div>
  );
}

