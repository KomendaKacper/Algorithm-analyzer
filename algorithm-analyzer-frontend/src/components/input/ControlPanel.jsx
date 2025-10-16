import Shuffle from "../../uiComponents/ShuffleHeader";
import AlgorithmPanel from "./AlgorithmPanel";
import ProblemPanel from "./ProblemPanel";

export default function ControlPanel({
  algorithms,
  algorithmResult,
  currentTask,
  setCurrentTask,
  isAlgorithmRunning,
  handleExecuteCurrentTask,
}) {
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
        Wykonaj
      </button>
    </div>
  );
}
