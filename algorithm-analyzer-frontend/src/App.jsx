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
  const [tasks, setTasks] = useState([{}]);

  const [openPanels, setOpenPanels] = useState([]);
  const [panelPositions, setPanelPositions] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [scatterPlotData, setScatterPlotData] = useState([]);
  
  // --- NOWY STAN: Zarządzanie motywem ---
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    getAlgorithms().then(res => setAlgorithms(res.data)).catch(err => console.error("Błąd ładowania algorytmów:", err));
  }, []);

  // --- NOWY EFEKT: Aplikuje klasę do body i zapisuje w localStorage ---
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- NOWA FUNKCJA: Przełącznik motywu ---
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const runAnalysis = async (tasksToRun) => {
    if (!problemConfig.name || tasksToRun.length === 0 || tasksToRun.some(t => !t || !t.name)) {
      return [{ success: false, errorMessage: "Upewnij się, że problem oraz wszystkie algorytmy są w pełni skonfigurowane." }];
    }
    setIsAlgorithmRunning(true);
    const payload = {
      problemParameters: problemConfig.parameters,
      algorithms: tasksToRun.map(task => ({
        name: task.name,
        parameters: task.algorithmParameters || task.parameters, 
      })),
    };
    try {
      const response = await executeComparison(problemConfig.name, payload);
      return response.data;
    } catch (error) {
      console.error("Błąd wykonania porównania:", error);
      return [{ success: false, errorMessage: error.response?.data?.errorMessage || error.message || "Błąd sieci" }];
    } finally {
      setIsAlgorithmRunning(false);
    }
  };

  const handleExecuteCurrentTask = async () => {
    setResults([]);
    const newResults = await runAnalysis(tasks);
    setResults(newResults);
  };

  const handleRunStabilityAnalysis = async (runCount) => {
    if (tasks.length === 0 || tasks.some(t => !t || !t.name)) {
        setResults([{ success: false, errorMessage: "Skonfiguruj co najmniej jeden algorytm, aby uruchomić analizę stabilności." }]);
        return;
    }
    setIsAlgorithmRunning(true);
    setResults([]);
    const stabilityResults = [];
    for (const task of tasks) {
        if (!task.name) continue;
        const taskResults = [];
        for (let i = 0; i < runCount; i++) {
            await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 50)); 
            const singleTaskPayload = [{ name: task.name, algorithmParameters: task.algorithmParameters }];
            const response = await runAnalysis(singleTaskPayload);
            if (response && response[0] && response[0].success) {
                taskResults.push(response[0]);
            }
        }
        if (taskResults.length > 0) {
            stabilityResults.push(...taskResults);
        }
    }
    setIsAlgorithmRunning(false);
    if (stabilityResults.length > 0) {
        addPanel('stability-chart', stabilityResults);
    } else {
        setResults([{ success: false, errorMessage: "Analiza stabilności nie powiodła się. Sprawdź konsolę." }]);
    }
  };

  const handleRunScatterAnalysis = async (runCount) => {
      if (tasks.length === 0 || tasks.some(t => !t || !t.name)) {
          setResults([{ success: false, errorMessage: "Skonfiguruj co najmniej jeden algorytm, aby uruchomić analizę rozrzutu." }]);
          return;
      }
      setIsAlgorithmRunning(true);
      setResults([]);
      const scatterResults = [];
      for (const task of tasks) {
          if (!task.name) continue;
          for (let i = 0; i < runCount; i++) {
              await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 50)); 
              const singleTaskPayload = [{ name: task.name, algorithmParameters: task.algorithmParameters }];
              const response = await runAnalysis(singleTaskPayload);
              if (response && response[0] && response[0].success) {
                  scatterResults.push(response[0]);
              }
          }
      }
      setIsAlgorithmRunning(false);
      if (scatterResults.length > 0) {
          setScatterPlotData(prevData => [...prevData, ...scatterResults]);
          if (!openPanels.some(p => p.type === 'scatter-plot')) {
              addPanel('scatter-plot', 'placeholder');
          }
      } else {
          setResults([{ success: false, errorMessage: "Analiza rozrzutu nie powiodła się. Sprawdź konsolę." }]);
      }
  };
  
  const addPanel = (type, data) => {
    const id = `${type}-${Date.now()}`;
    setOpenPanels(prev => [...prev, { id, type, data, minimized: false }]);
    const panelStartLeft = isSidebarCollapsed ? 80 : 450;
    const isChartPanel = type.startsWith('charts') || type.startsWith('matrix') || type.startsWith('animated') || type.includes('plot') || type.includes('chart');
    setPanelPositions(prev => ({ ...prev, [id]: { top: 120 + Object.keys(prev).length * 30, left: panelStartLeft + Object.keys(prev).length * 30, width: isChartPanel ? 900 : 800, height: 500 } }));
  };

  const removePanel = (id) => { setOpenPanels(prev => prev.filter((p) => p.id !== id)); };
  const togglePanelMinimize = (id) => { setOpenPanels(prev => prev.map(p => (p.id === id ? { ...p, minimized: !p.minimized } : p))); };

  return (
    <div className={`App ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className="sidebar">
            <ControlPanel
              algorithms={algorithms}
              tasks={tasks} setTasks={setTasks}
              problemConfig={problemConfig} setProblemConfig={setProblemConfig}
              isAlgorithmRunning={isAlgorithmRunning}
              handleExecuteCurrentTask={handleExecuteCurrentTask}
              handleRunStabilityAnalysis={handleRunStabilityAnalysis}
              handleRunScatterAnalysis={handleRunScatterAnalysis}
              // --- ZMIANA: Przekazujemy stan i funkcję do przełącznika ---
              theme={theme}
              toggleTheme={toggleTheme}
            />
            <button className="sidebar-toggle" onClick={() => setIsSidebarCollapsed(prev => !prev)} title={isSidebarCollapsed ? "Rozwiń panel" : "Zwiń panel"}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
        </div>
        <div className="main-content">
            {results.length > 0 && <ResultPanelWrapper results={results} addPanel={addPanel} />}
            <DraggablePanels
              openPanels={openPanels}
              panelPositions={panelPositions} setPanelPositions={setPanelPositions}
              removePanel={removePanel}
              toggleMinimize={togglePanelMinimize}
              scatterPlotData={scatterPlotData}
            />
        </div>
      <AlgorithmOverlay isAlgorithmRunning={isAlgorithmRunning} />
    </div>
  );
}

