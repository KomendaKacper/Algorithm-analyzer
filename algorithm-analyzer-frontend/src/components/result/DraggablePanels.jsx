// src/components/DraggablePanels.jsx
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
        return (
          <div
            key={panel.id}
            className={`draggable-panel ${
              panel.type.startsWith("charts") ? "panel-charts" : "panel-table"
            }`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="panel-header" onMouseDown={(e) => startDrag(e, panel.id)}>
              <span className="panel-title">
                {panel.type === "table" && "Tabela iteracji"}
                {panel.type === "charts-distance" && "Wykres dystansów"}
                {panel.type === "charts-time" && "Wykres czasu"}
                {panel.type === "charts-gap" && "Różnica"}
                {panel.type === "charts-violations" && "Naruszenia ograniczeń"}
                {panel.type === "charts-diversity" && "Różnorodność [%]"}
                {panel.type === "charts-stagnation" && "Zastój iteracji"}
              </span>
              <button className="panel-close-btn" onClick={() => removePanel(panel.id)}>
                ✕
              </button>
            </div>

            <div className="panel-content">
              {panel.type === "table" && <AcoIterationTable data={panel.data.data || panel.data} />}
              {panel.type === "charts-distance" && (
                <DistanceChart
                  data={panel.data.data || panel.data}
                  algorithmName={panel.data.algorithmName || "ACO"}
                  showAverage={false}
                />
              )}
              {panel.type.startsWith("charts-") && panel.type !== "charts-distance" && (
                <MetricChart
                  data={panel.data.data}
                  dataKey={
                    panel.type === "charts-time"
                      ? "executionDurationMs"
                      : panel.type === "charts-gap"
                      ? "gap"
                      : panel.type === "charts-violations"
                      ? "constraintViolations"
                      : panel.type === "charts-diversity"
                      ? "diversity"
                      : "stagnation"
                  }
                  name={
                    panel.type === "charts-time"
                      ? "Czas [ms]"
                      : panel.type === "charts-gap"
                      ? "Różnica"
                      : panel.type === "charts-violations"
                      ? "Naruszenia ograniczeń"
                      : panel.type === "charts-diversity"
                      ? "Różnorodność [%]"
                      : "Zastój iteracji"
                  }
                  color="#3498DB"
                  trendColor="#2ECC71"
                  algorithmName={panel.data.algorithmName || "ACO"}
                  showTrend={true}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
