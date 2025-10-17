import { useState } from "react";
import Shuffle from "../../uiComponents/ShuffleHeader";
import AlgorithmPanel from "./AlgorithmPanel";
import ProblemPanel from "./ProblemPanel";
import ResultPanelWrapper from "../result/ResultPanelWrapper";

export default function ControlPanel({
  algorithms,
  algorithmResult,
  currentTask,
  setCurrentTask,
  isAlgorithmRunning,
  handleExecuteCurrentTask,
  addPanel, // Prop `onShowPheromones` usunięty
}) {
  const [isResultVisible, setIsResultVisible] = useState(true);

  return (
    <div className="controls-panel">
      <Shuffle text="Algorithm Analyzer" shuffleDirection="right" duration={3} />

      <div className="panels-container">
        <ProblemPanel setCurrentTask={setCurrentTask} />
        <AlgorithmPanel
          algorithms={algorithms}
          currentTask={currentTask}
          setCurrentTask={setCurrentTask}
          selectedProblemName={currentTask?.problemName}
        />
      </div>

      <button
        className="panel-button"
        onClick={handleExecuteCurrentTask}
        disabled={!currentTask?.name || !currentTask?.problemName || isAlgorithmRunning}
      >
        {isAlgorithmRunning ? "Pracuję..." : "🚀 Wykonaj Analizę"}
      </button>

      {algorithmResult && (
        <ResultPanelWrapper
          algorithmResult={algorithmResult}
          isResultVisible={isResultVisible}
          setIsResultVisible={setIsResultVisible}
          addPanel={addPanel} // Prop `onShowPheromones` usunięty
        />
      )}
    </div>
  );
}