// src/components/ResultPanelWrapper.jsx
import AlgorithmResultPanel from "./AlgorithmResultPanel";

export default function ResultPanelWrapper({
  algorithmResult,
  isResultVisible,
  setIsResultVisible,
  addPanel,
}) {
  if (!algorithmResult) return null;

  return (
    <>
      <div className="result-toggle">
        <button
          onClick={() => setIsResultVisible(!isResultVisible)}
          className="toggle-button"
        >
          {isResultVisible ? "▲ Ukryj wynik" : "▼ Pokaż wynik"}
        </button>
      </div>

      {isResultVisible && (
        <AlgorithmResultPanel result={algorithmResult} addPanel={addPanel} />
      )}
    </>
  );
}
