import { useState } from "react";
import { DistanceChart } from "./DistanceChart";
import { TimeChart } from "./TimeChart";
import { cleanIterationData } from "../../functions/cleanIterationData";

export default function AcoIterationCharts({
  data,
  showDistance = true,
  showTime = true,
}) {
  const [showTrend, setShowTrend] = useState(true); // 👈 stan widoczności trendu
  const cleanData = cleanIterationData(data);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* 🔘 Przycisk toggle trendu */}
      {showDistance && (
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <button
            onClick={() => setShowTrend((prev) => !prev)}
            style={{
              background: showTrend
                ? "linear-gradient(135deg, #3498db 0%, #2980b9 100%)"
                : "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {showTrend ? "Ukryj trend" : "Pokaż trend"}
          </button>
        </div>
      )}

      {/* 🔹 Wykresy odległości */}
      {showDistance && <DistanceChart data={cleanData} showTrend={showTrend} />}

      {/* 🔹 Wykres czasu */}
      {showTime && <TimeChart data={cleanData} />}
    </div>
  );
}
