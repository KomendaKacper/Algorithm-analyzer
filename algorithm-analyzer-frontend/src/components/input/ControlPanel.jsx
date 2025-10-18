import { useState } from "react";
import Shuffle from "../../uiComponents/ShuffleHeader";
import AlgorithmPanel from "./AlgorithmPanel";
import ProblemPanel from "./ProblemPanel";

export default function ControlPanel({
  algorithms, tasks, setTasks,
  problemConfig, setProblemConfig,
  isAlgorithmRunning, handleExecuteCurrentTask,
}) {
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  const handleToggleComparison = () => {
    setIsComparisonMode(prev => {
      const newMode = !prev;
      if (!newMode && tasks.length > 1) {
        setTasks([tasks[0]]);
      } else if (newMode && tasks.length < 2) {
        // Dodaj pusty slot na drugi algorytm
        setTasks(prev => [...prev, {}]); 
      }
      return newMode;
    });
  };
  
  return (
    <div className="controls-panel">
      <Shuffle text="Algorithm Analyzer" shuffleDirection="right" duration={3} />

      <div className="panels-container">
        <ProblemPanel setProblemConfig={setProblemConfig} />

        <div className="comparison-container">
          <div className="comparison-toggle">
            <label>Tryb Porównawczy</label>
            <input type="checkbox" checked={isComparisonMode} onChange={handleToggleComparison} />
          </div>
          <div className="algorithm-panels-wrapper">
            <AlgorithmPanel
              key={0}
              panelId={0}
              algorithms={algorithms}
              tasks={tasks}
              setTasks={setTasks}
              problemName={problemConfig.name}
            />
            {isComparisonMode && (
              <AlgorithmPanel
                key={1}
                panelId={1}
                algorithms={algorithms}
                tasks={tasks}
                setTasks={setTasks}
                problemName={problemConfig.name}
              />
            )}
          </div>
        </div>
      </div>

      <button
        className="panel-button"
        onClick={handleExecuteCurrentTask}
        disabled={!problemConfig.name || tasks.length === 0 || tasks.some(t => !t || !t.name) || isAlgorithmRunning}
      >
        {isAlgorithmRunning ? "Pracuję..." : "🚀 Wykonaj Analizę"}
      </button>

      {/* Panel wyników został przeniesiony do App.jsx */}
    </div>
  );
}

