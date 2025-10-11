// src/components/AlgorithmOverlay.jsx
import FallingText from "../../uiComponents/FallingText";

export default function AlgorithmOverlay({ isAlgorithmRunning, showFallingText }) {
  if (!isAlgorithmRunning) return null;

  return (
    <div className="algorithm-overlay">
      {!showFallingText ? (
        <div className="algorithm-loading">
          <div className="spinner"></div>
          <p>⏳ Wykonywanie algorytmu... proszę czekać</p>
        </div>
      ) : (
        <FallingText
          text={`Algorytm został zakończony`}
          highlightWords={["Algorytm"]}
          highlightClass="highlighted"
          trigger="hover"
          backgroundColor="transparent"
          wireframes={false}
          gravity={0.56}
          fontSize="2rem"
          mouseConstraintStiffness={0.9}
        />
      )}
    </div>
  );
}
