// src/components/ControlPanel.jsx
import Shuffle from "../../uiComponents/ShuffleHeader";
import GraphControls from "./GraphControls";
import AlgorithmPanel from "./AlgorithmPanel";

export default function ControlPanel({
  graphs,
  selectedGraphSummary,
  handleSelectGraph,
  handleGenerateRandom,
  algorithms,
  selectedGraphDetails,
  handleExecuteAlgorithm,
  algorithmResult,
}) {
  return (
    <div className="controls-panel">
      <Shuffle text="Algorithm Analyzer" shuffleDirection="right" duration={3} />
      <GraphControls
        graphs={graphs}
        selectedGraph={selectedGraphSummary}
        onSelectGraph={handleSelectGraph}
        onGenerateRandom={handleGenerateRandom}
      />
      <AlgorithmPanel
        algorithms={algorithms}
        selectedGraph={selectedGraphDetails}
        onExecuteAlgorithm={handleExecuteAlgorithm}
        result={algorithmResult}
      />
    </div>
  );
}
