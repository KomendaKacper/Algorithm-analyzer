// src/components/AlgorithmOverlay.jsx
import { useEffect, useState } from "react";
import FallingText from "../../uiComponents/FallingText"; // Upewnij się, że masz ten komponent

export default function AlgorithmOverlay({ isAlgorithmRunning }) {
  const [gravity, setGravity] = useState(0);
  const [visible, setVisible] = useState(false);
  const [trigger, setTrigger] = useState("none");
  const [componentKey, setComponentKey] = useState(0);

  useEffect(() => {
    if (isAlgorithmRunning) {
      if (!visible) {
        setVisible(true);
        setGravity(0);
        setTrigger("none");
        setComponentKey(prev => prev + 1);
      }
    } else if (visible) {
      setGravity(0.56);
      setTrigger("auto");
      const timeout = setTimeout(() => {
        setVisible(false);
        setGravity(0);
        setTrigger("none");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isAlgorithmRunning, visible]);

  if (!visible) return null;

  return (
    <div className={`algorithm-overlay ${!isAlgorithmRunning ? "finished" : ""}`}>
      <FallingText
        key={componentKey}
        text="⏳ Obliczanie... proszę czekać"
        highlightWords={["Obliczanie..."]}
        highlightClass="highlighted"
        backgroundColor="transparent"
        gravity={gravity}
        fontSize="2rem"
        mouseConstraintStiffness={0.9}
        wireframes={false}
        trigger={trigger}
      />
    </div>
  );
}