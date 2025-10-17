// src/components/result/DraggablePanels.jsx

import AcoIterationTable from "./AcoIterationTable";
import { MetricChart } from "./charts/MetricChart";
import { DistanceChart } from "./charts/DistanceChart";

export default function DraggablePanels({
  openPanels,
  panelPositions,
  setPanelPositions,
  removePanel,
}) {
  const startDrag = (e, id) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const pos = panelPositions[id] || { top: 100, left: 100 };

    const onMouseMove = (moveEvent) => {
      const newTop = pos.top + (moveEvent.clientY - startY);
      const newLeft = pos.left + (moveEvent.clientX - startX);
      setPanelPositions((prev) => ({ ...prev, [id]: { top: newTop, left: newLeft } }));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      {openPanels.map((panel) => {
        const pos = panelPositions[panel.id] || {};
        // --- POPRAWKA: Wyciągamy potrzebne dane z obiektu panel.data ---
        const iterationData = panel.data?.iterationResults || [];
        const algorithmName = panel.data?.algorithmName || "Algorytm";

        return (
          <div
            key={panel.id}
            className={`draggable-panel ${panel.type.startsWith("charts") ? "panel-charts" : "panel-table"}`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="panel-header" onMouseDown={(e) => startDrag(e, panel.id)}>
              <span className="panel-title">
                {panel.type === "table" && "📊 Tabela iteracji"}
                {panel.type === "charts-distance" && "📈 Wykresy wyników"}
                {panel.type === "charts-diversity" && "🧬 Różnorodność"}
                {panel.type === "charts-stagnation" && "⏳ Stagnacja"}
              </span>
              <button className="panel-close-btn" onClick={() => removePanel(panel.id)}>✕</button>
            </div>

            <div className="panel-content">
              {panel.type === "table" && <AcoIterationTable data={iterationData} />}

              {panel.type === "charts-distance" && (
                <DistanceChart data={iterationData} algorithmName={algorithmName} />
              )}

              {panel.type.startsWith("charts-") && panel.type !== "charts-distance" && (
                <MetricChart
                  data={iterationData}
                  dataKey={panel.type === "charts-diversity" ? "diversity" : "stagnation"}
                  name={panel.type === "charts-diversity" ? "Różnorodność" : "Stagnacja"}
                  color={panel.type === "charts-diversity" ? "#9b59b6" : "#f1c40f"}
                  algorithmName={algorithmName}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}