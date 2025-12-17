import React, { useState, useEffect, useCallback } from "react";
import { getAlgorithms, executeComparison } from "./api/algorithmApi";
import { getProblems } from "./api/problemApi";

import ControlPanel from "./components/input/ControlPanel";
import DraggablePanels from "./components/result/DraggablePanels";
import AlgorithmOverlay from "./components/result/AlgorithmOverlay";
import ResultPanelWrapper from "./components/result/ResultPanelWrapper";
import { SolutionGraphPanel } from "./components/result/charts/SolutionGraphPanel";
import AddAlgorithmModal from './components/input/AddAlgorithmModal';
import AddProblemModal from './components/input/AddProblemModal';
import WelcomeScreen from "./components/view/WelcomeScreen";
import TourGuide from "./components/view/TourGuide";
import "./App.css";

const TOUR_STEPS = [
  {
    selector: '[data-tour="step-problem"]',
    title: '1. Zdefiniuj Problem',
    content: 'Wybierz typ problemu (np. TSP, Plecakowy) i skonfiguruj jego parametry, takie jak liczba miast czy pojemność.'
  },
  {
    selector: '[data-tour="step-algorithm"]',
    title: '2. Wybierz Algorytmy',
    content: 'Dodaj jeden lub więcej algorytmów do porównania. Możesz dostosować ich parametry indywidualnie.'
  },
  {
    selector: '[data-tour="step-analysis"]',
    title: '3. Analiza Zaawansowana',
    content: 'Tutaj możesz uruchomić wielokrotne przebiegi, aby zbadać stabilność wyników i rozrzut rozwiązań.'
  },
  {
    selector: '[data-tour="step-extensions"]',
    title: '4. Rozszerzenia',
    content: 'W tym panelu możesz dodać własne implementacje algorytmów lub problemów, korzystając z wbudowanego edytora kodu.'
  },
  {
    selector: '[data-tour="step-run"]',
    title: '5. Uruchom',
    content: 'Gdy wszystko gotowe, kliknij ten przycisk, aby rozpocząć symulację i zobaczyć wyniki na żywo!'
  }
];

export default function App() {
  const [algorithms, setAlgorithms] = useState([]);
  const [problems, setProblems] = useState([]);
  const [results, setResults] = useState([]);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  
  const [problemConfig, setProblemConfig] = useState({ name: null, parameters: {} });
  const [tasks, setTasks] = useState([{}]);

  const [openPanels, setOpenPanels] = useState([]);
  const [panelPositions, setPanelPositions] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [scatterPlotData, setScatterPlotData] = useState([]);
  
  const [minimizedPanels, setMinimizedPanels] = useState({});
  const [isComparisonMinimized, setIsComparisonMinimized] = useState(false);
  
  const [isAddAlgoModalOpen, setIsAddAlgoModalOpen] = useState(false);
  const [isAddProblemModalOpen, setIsAddProblemModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('loading'); // 'loading', 'connected', 'error'

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", JSON.stringify(true));
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", JSON.stringify(false));
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const refreshAlgorithms = useCallback(() => {
    console.log("Odświeżanie listy algorytmów...");
    getAlgorithms()
      .then(res => setAlgorithms(res.data))
      .catch(err => console.error("Błąd ładowania algorytmów:", err));
  }, []);

  const refreshProblems = useCallback(() => {
    console.log("Odświeżanie listy problemów...");
    getProblems()
      .then(res => setProblems(res.data))
      .catch(err => console.error("Błąd ładowania problemów:", err));
  }, []);

  useEffect(() => {
    const initData = async () => {
      setBackendStatus('loading');
      try {
        const [algoRes, probRes] = await Promise.all([
            getAlgorithms(),
            getProblems()
        ]);
        setAlgorithms(algoRes.data);
        setProblems(probRes.data);
        setBackendStatus('connected');
      } catch (e) {
        console.error("Initial data load failed", e);
        setBackendStatus('error');
      }
    };
    initData();
  }, []);
  
  const runAnalysis = async (tasksToRun, manageState = true) => {
    if (!problemConfig.name || tasksToRun.length === 0 || tasksToRun.some(t => !t || !t.name)) {
      return [{ success: false, errorMessage: "Upewnij się, że problem oraz wszystkie algorytmy są w pełni skonfigurowane." }];
    }
    if (manageState) setIsAlgorithmRunning(true);
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
      if (manageState) setIsAlgorithmRunning(false);
    }
  };

  const handleExecuteCurrentTask = async () => {
    setResults([]);
    const newResults = await runAnalysis(tasks);
    setResults(newResults);
    setMinimizedPanels({});
    setIsComparisonMinimized(false);
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
            const response = await runAnalysis(singleTaskPayload, false);
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
              const response = await runAnalysis(singleTaskPayload, false);
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
    
    const isChartPanel = type.startsWith('charts') || type.startsWith('matrix') || type.startsWith('animated') || type.includes('plot') || type.includes('chart');
    const width = isChartPanel ? 900 : 800;
    const height = 500;

    // Centrowanie z lekkim przesunięciem dla kolejnych okien
    const offset = openPanels.length * 30;
    const left = Math.max(100, (window.innerWidth - width) / 2 + offset);
    const top = Math.max(50, (window.innerHeight - height) / 2 + offset);

    setPanelPositions(prev => ({ ...prev, [id]: { top, left, width, height } }));
  };

  const removePanel = (id) => { 
    setOpenPanels(prev => prev.filter((p) => p.id !== id));
    setPanelPositions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
    });
  };
  const togglePanelMinimize = (id) => { setOpenPanels(prev => prev.map(p => (p.id === id ? { ...p, minimized: !p.minimized } : p))); };

  const toggleMinimizePanel = (panelId) => {
    setMinimizedPanels(prev => ({ ...prev, [panelId]: !prev[panelId] }));
  };
  const toggleComparisonMinimize = () => {
    setIsComparisonMinimized(p => !p);
  };
  
  const showResultsWrapper = results.length > 0;

  const showSolutionGraph = 
    showResultsWrapper &&
    results.every(r => r.success) &&
    results[0].iterationResults?.[0]?.currentSolution;

  if (backendStatus === 'loading') {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2>Łączenie z serwerem...</h2>
        <p>Proszę czekać, trwa pobieranie danych.</p>
      </div>
    );
  }

  if (backendStatus === 'error') {
    return (
      <div className="error-screen">
        <div className="error-icon">⚠️</div>
        <h2>Błąd połączenia</h2>
        <p>Nie udało się połączyć z serwerem backendu.</p>
        <button onClick={() => window.location.reload()}>Spróbuj ponownie</button>
      </div>
    );
  }

  return (
    <div className={`App ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className="sidebar">
            <ControlPanel
              algorithms={algorithms}
              problems={problems}
              tasks={tasks} setTasks={setTasks}
              problemConfig={problemConfig} setProblemConfig={setProblemConfig}
              isAlgorithmRunning={isAlgorithmRunning}
              handleExecuteCurrentTask={handleExecuteCurrentTask}
              handleRunStabilityAnalysis={handleRunStabilityAnalysis}
              handleRunScatterAnalysis={handleRunScatterAnalysis}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              onAddAlgorithmClick={() => setIsAddAlgoModalOpen(true)}
              onAddProblemClick={() => setIsAddProblemModalOpen(true)}
            />
            <button className="sidebar-toggle" onClick={() => setIsSidebarCollapsed(prev => !prev)} title={isSidebarCollapsed ? "Rozwiń panel" : "Zwiń panel"}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
        </div>
        <div className="main-content">
            
            {!showResultsWrapper && openPanels.length === 0 && (
              <WelcomeScreen onStartTour={() => setIsTourOpen(true)} />
            )}

            {showResultsWrapper && (
              <ResultPanelWrapper 
                results={results} 
                addPanel={addPanel} 
                minimizedPanels={minimizedPanels}
                toggleMinimizePanel={toggleMinimizePanel}
                isComparisonMinimized={isComparisonMinimized}
                toggleComparisonMinimize={toggleComparisonMinimize}
              />
            )}

            {showSolutionGraph && (
              <SolutionGraphPanel 
                results={results}
              />
            )}
            
            <DraggablePanels
              openPanels={openPanels}
              panelPositions={panelPositions} setPanelPositions={setPanelPositions}
              removePanel={removePanel}
              toggleMinimize={togglePanelMinimize}
              scatterPlotData={scatterPlotData}
            />
        </div>
      <AlgorithmOverlay isAlgorithmRunning={isAlgorithmRunning} />
      
      <AddAlgorithmModal
        isOpen={isAddAlgoModalOpen}
        onClose={() => setIsAddAlgoModalOpen(false)}
        onAlgorithmAdded={refreshAlgorithms} 
      />

      {/* --- RENDERUJ NOWY MODAL DLA PROBLEMÓW --- */}
      <AddProblemModal
        isOpen={isAddProblemModalOpen}
        onClose={() => setIsAddProblemModalOpen(false)}
        onProblemAdded={refreshProblems}
      />

      <TourGuide 
        steps={TOUR_STEPS}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}