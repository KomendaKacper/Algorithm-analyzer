import { useState } from "react";
import AlgorithmPanel from "./AlgorithmPanel";
import ProblemPanel from "./ProblemPanel";
import Shuffle from "../../uiComponents/ShuffleHeader";
import CollapsiblePanel from "../../uiComponents/CollapsiblePanel"; 
import ThemeToggle from "../../uiComponents/ThemeToggle"; 

export default function ControlPanel({ 
  algorithms, 
  problems, // --- NOWY PROP ---
  tasks, 
  setTasks, 
  problemConfig, 
  setProblemConfig,
  isAlgorithmRunning,
  handleExecuteCurrentTask,
  handleRunStabilityAnalysis,
  handleRunScatterAnalysis,
  isDarkMode, 
  toggleDarkMode,
  onAddAlgorithmClick,
  onAddProblemClick // --- NOWY PROP ---
}) {

  const [runCount, setRunCount] = useState(10);

  const addAlgorithmPanel = () => {
    setTasks(prevTasks => [...prevTasks, {}]);
  };

  const removeAlgorithmPanel = (panelIdToRemove) => {
    setTasks(prevTasks => prevTasks.filter((_, index) => index !== panelIdToRemove));
  };
  
  return (
    <div className="controls-panel">
      <div className="app-header">
        <Shuffle text="Algorithm Analyzer" shuffleDirection="right" duration={3} />
        
        <ThemeToggle theme={isDarkMode} toggleTheme={toggleDarkMode} />
      
      </div>

      <div className="panels-container">
        <CollapsiblePanel title="1. Definicja Problemu" startOpen={true}>
          {/* Przekaż listę problemów do panelu */}
          <ProblemPanel 
            problems={problems} 
            setProblemConfig={setProblemConfig} 
          />
        </CollapsiblePanel>

        <CollapsiblePanel title="2. Konfiguracja Algorytmów" startOpen={true}>
          <div className="algorithm-panels-wrapper">
            {tasks.map((_, index) => (
              <AlgorithmPanel
                key={index}
                panelId={index}
                algorithms={algorithms}
                tasks={tasks}
                setTasks={setTasks}
                problemName={problemConfig.name}
                onRemove={removeAlgorithmPanel}
                canBeRemoved={tasks.length > 1}
              />
            ))}
            <button onClick={addAlgorithmPanel} className="add-algorithm-button">
              + Dodaj algorytm do porównania
            </button>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel title="3. Analiza Zaawansowana" startOpen={false}>
          <div className="form-group">
            <label htmlFor="runCountInput">Liczba przebiegów</label>
            <input 
              id="runCountInput"
              type="number" 
              className="input" 
              value={runCount} 
              onChange={e => setRunCount(parseInt(e.target.value, 10) || 1)} 
              min="2" 
              max="100" 
            />
          </div>
          <button 
              className="panel-button secondary"
              onClick={() => handleRunStabilityAnalysis(runCount)}
              disabled={tasks.length === 0 || tasks.some(t => !t || !t.name) || isAlgorithmRunning}
              title="Uruchamia wszystkie skonfigurowane algorytmy N razy, aby zbadać powtarzalność ich wyników."
            >
              📊 Uruchom Analizę Stabilności
          </button>
          <button 
              className="panel-button secondary"
              onClick={() => handleRunScatterAnalysis(runCount)}
              disabled={tasks.length === 0 || tasks.some(t => !t || !t.name) || isAlgorithmRunning}
              title="Uruchamia wszystkie skonfigurowane algorytmy N razy i dodaje wyniki do globalnego wykresu rozrzutu."
            >
              ✨ Uruchom Analizę Rozrzutu
          </button>
        </CollapsiblePanel>
        
        <CollapsiblePanel title="4. Rozszerzenia" startOpen={false}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <button 
              onClick={onAddAlgorithmClick}
              className="panel-button secondary"
              title="Dodaj własną implementację algorytmu przez edytor kodu."
            >
              ➕ Dodaj własny algorytm
            </button>
            {/* --- NOWY PRZYCISK --- */}
            <button 
              onClick={onAddProblemClick}
              className="panel-button secondary"
              title="Dodaj własną implementację problemu przez edytor kodu."
            >
              ➕ Dodaj własny problem
            </button>
          </div>
        </CollapsiblePanel>
        
      </div>

      <button
        className="panel-button"
        onClick={handleExecuteCurrentTask}
        disabled={!problemConfig.name || tasks.length === 0 || tasks.some(t => !t || !t.name) || isAlgorithmRunning}
      >
        {isAlgorithmRunning ? "Pracuję..." : "🚀 Wykonaj Analizę"}
      </button>
    </div>
  );
}