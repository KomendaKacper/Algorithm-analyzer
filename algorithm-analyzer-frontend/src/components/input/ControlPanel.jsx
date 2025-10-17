import { useState } from "react";
import Shuffle from "../../uiComponents/ShuffleHeader";
import AlgorithmPanel from "./AlgorithmPanel";
import ProblemPanel from "./ProblemPanel";
import ResultPanelWrapper from "../result/ResultPanelWrapper";

export default function ControlPanel({
  algorithms, results, tasks, setTasks,
  problemConfig, setProblemConfig,
  isAlgorithmRunning, handleExecuteCurrentTask, addPanel,
}) {
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  const handleToggleComparison = () => {
    setIsComparisonMode(prev => {
      const newMode = !prev;
      // Przy wyłączeniu trybu porównawczego, zostaw tylko pierwszy algorytm
      if (!newMode && tasks.length > 1) {
        setTasks([tasks[0]]);
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
              key={0} // Klucz jest ważny dla Reacta
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
        disabled={!problemConfig.name || tasks.length === 0 || tasks.some(t => !t.name) || isAlgorithmRunning}
      >
        {isAlgorithmRunning ? "Pracuję..." : "🚀 Wykonaj Analizę"}
      </button>

      {results.length > 0 && <ResultPanelWrapper results={results} addPanel={addPanel} />}
    </div>
  );
}