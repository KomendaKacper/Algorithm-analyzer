// src/components/view/PheromoneControl.jsx
import { useState, useEffect, useRef } from "react";

export default function PheromoneControl({ 
  maxIterations, 
  currentIteration, 
  onIterationChange 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (currentIteration >= maxIterations) {
          setIsPlaying(false);
          return;
        }
        onIterationChange(currentIteration + 1);
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentIteration, maxIterations]); // onIterationChange usunięte z zależności!

  const handlePlayPause = () => {
    if (currentIteration >= maxIterations && !isPlaying) {
      onIterationChange(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{
      position: "absolute",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(255, 255, 255, 0.95)",
      padding: "15px 20px",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      minWidth: "400px",
      maxWidth: "600px",
      zIndex: 100
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "15px",
        fontSize: "14px",
        fontWeight: "600"
      }}>
        <span style={{ color: "#e74c3c", whiteSpace: "nowrap" }}>🐜 Iteracja:</span>
        <span style={{ 
          color: "#2c3e50",
          fontSize: "16px",
          minWidth: "80px",
          textAlign: "center"
        }}>
          {currentIteration} / {maxIterations}
        </span>
        
        <input
          type="range"
          min="0"
          max={maxIterations}
          value={currentIteration}
          onChange={(e) => onIterationChange(Number(e.target.value))}
          style={{ 
            flex: 1,
            cursor: "pointer"
          }}
        />
        
        <button
          onClick={handlePlayPause}
          style={{
            background: isPlaying ? "#e74c3c" : "#2ecc71",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            whiteSpace: "nowrap",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          {isPlaying ? "⏸ Stop" : "▶ Play"}
        </button>
      </div>
      
      <div style={{
        fontSize: "12px",
        color: "#7f8c8d",
        textAlign: "center"
      }}>
        Czerwone krawędzie = wyższy poziom feromonów
      </div>
    </div>
  );
}