import AlgorithmPanel from "./AlgorithmPanel";
import ProblemPanel from "./ProblemPanel";
import Shuffle from "../../uiComponents/ShuffleHeader";

export default function ControlPanel({
  algorithms, tasks, setTasks,
  problemConfig, setProblemConfig,
  isAlgorithmRunning, handleExecuteCurrentTask,
}) {

  const addAlgorithmPanel = () => {
    setTasks(prevTasks => [...prevTasks, {}]);
  };

  const removeAlgorithmPanel = (panelIdToRemove) => {
    setTasks(prevTasks => prevTasks.filter((_, index) => index !== panelIdToRemove));
  };
  
  return (
    <div className="controls-panel">
      <Shuffle text="Algorithm Analyzer" shuffleDirection="right" duration={3} />

      <div className="panels-container">
        <ProblemPanel setProblemConfig={setProblemConfig} />

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

