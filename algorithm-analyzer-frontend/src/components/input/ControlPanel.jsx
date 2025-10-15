import Shuffle from "../../uiComponents/ShuffleHeader";
import GraphControls from "./GraphControls";
import AlgorithmPanel from "./AlgorithmPanel";
import ProblemPanel from "./ProblemPanel";
import api from "../../api/graphApi";

export default function ControlPanel({
  graphs,
  selectedGraphSummary,
  handleSelectGraph,
  handleGenerateRandom,
  algorithms,
  selectedGraphDetails,
  algorithmResult,
  currentTask,
  setCurrentTask,
  isAlgorithmRunning,
  setIsAlgorithmRunning,
  setAlgorithmResult,
  setIsResultVisible,
}) {
  const handleExecuteCurrentTask = async () => {
    if (!selectedGraphSummary || !currentTask?.type) return;

    setIsAlgorithmRunning(true);
    setIsResultVisible(false);

    try {
      let res;

      if (currentTask.type === "algorithm") {
        const algorithm = encodeURIComponent(currentTask.name);
        const problem = encodeURIComponent(currentTask.problemName || "default");

        res = await api.post(
          `/algorithms/${algorithm}/${problem}/execute?graphId=${selectedGraphSummary.id}`,
          currentTask.parameters
        );
      }

      setAlgorithmResult(res.data);
    } catch (err) {
      console.error("Execution error:", err);
      setAlgorithmResult({ success: false, errorMessage: err.message });
    } finally {
      setIsAlgorithmRunning(false);
      setTimeout(() => setIsResultVisible(true), 500);
    }
  };

  return (
    <div className="controls-panel">
      <Shuffle text="Algorithm Analyzer" shuffleDirection="right" duration={3} />

      <GraphControls
        graphs={graphs}
        selectedGraph={selectedGraphSummary}
        onSelectGraph={handleSelectGraph}
        onGenerateRandom={handleGenerateRandom}
      />

      <div className="panels-container">
        <ProblemPanel setCurrentTask={setCurrentTask} />

        <AlgorithmPanel
          algorithms={algorithms}
          selectedGraph={selectedGraphDetails}
          currentTask={currentTask}
          setCurrentTask={setCurrentTask}
          selectedProblemName={currentTask?.problemName}
        />
      </div>

      <button
        className="panel-button"
        onClick={handleExecuteCurrentTask}
        disabled={!currentTask?.name || !selectedGraphSummary || isAlgorithmRunning}
      >
        Wykonaj
      </button>
    </div>
  );
}
