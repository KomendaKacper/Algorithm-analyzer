// src/components/AlgorithmOverlay.jsx
import { useEffect, useState } from "react";
import FallingText from "../../uiComponents/FallingText";

export default function AlgorithmOverlay({ isAlgorithmRunning }) {
  const [gravity, setGravity] = useState(0);
  const [visible, setVisible] = useState(false);
  const [trigger, setTrigger] = useState("none");
  const [componentKey, setComponentKey] = useState(0); // 🔹 klucz do wymuszenia resetu

  useEffect(() => {
    if (isAlgorithmRunning) {
      // 🔹 Algorytm startuje → pokazujemy overlay, resetujemy komponent
      setVisible(true);
      setGravity(0);
      setTrigger("none");
      setComponentKey(prev => prev + 1); // 🔹 wymuszamy nowy mount
    } else if (visible) {
      // 🔹 Algorytm się kończy → uruchamiamy spadanie automatycznie
      setGravity(0.56);
      setTrigger("auto");

      // 🔹 po kilku sekundach usuwamy overlay
      const timeout = setTimeout(() => {
        setVisible(false);
        setGravity(0);
        setTrigger("none");
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [isAlgorithmRunning, visible]);

  if (!visible) return null;

  return (
    <div className="algorithm-overlay">
      <FallingText
        key={componentKey} // 🔹 wymusza pełny remount przy każdym uruchomieniu
        text="⏳ Wykonywanie algorytmu... proszę czekać"
        highlightWords={["algorytmu"]}
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