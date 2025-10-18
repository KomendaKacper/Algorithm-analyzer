import React, { useRef } from "react";
import IterationTable from "./IterationTable";
import { MetricChart } from "./charts/MetricChart";
import { ScoreChart } from "./charts/ScoreChart";
import { SpikeChart } from "./charts/SpikeChart"; // Import nowego komponentu

const PANEL_TITLES = {
  table: 'Tabela Iteracji',
  'charts-score': 'Wykres: Jakość Populacji / Trajektoria',
  'charts-time': 'Wykres: Czas wykonania',
  'charts-exploration': 'Wykres: Miara Eksploracji',
  'charts-improvements': 'Wykres: Częstotliwość Poprawy',
  'charts-relative-improvement': 'Wykres: Skoki Poprawy',
  'charts-stagnation': 'Wykres: Stagnacja',
};

export default function DraggablePanels({
  openPanels,
  panelPositions,
  setPanelPositions,
  removePanel,
}) {
  const dragInfo = useRef(null);

  const startDrag = (e, id) => {
    e.preventDefault();
    const panelElement = e.currentTarget.closest(".draggable-panel");
    const rect = panelElement.getBoundingClientRect();

    dragInfo.current = {
      id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };

    window.addEventListener("mousemove", dragMove);
    window.addEventListener("mouseup", stopDrag);
  };

  const dragMove = (e) => {
    if (!dragInfo.current) return;
    const { id, offsetX, offsetY } = dragInfo.current;
    const newTop = e.clientY - offsetY;
    const newLeft = e.clientX - offsetX;
    setPanelPositions((prev) => ({
      ...prev,
      [id]: { top: newTop, left: newLeft },
    }));
  };

  const stopDrag = () => {
    dragInfo.current = null;
    window.removeEventListener("mousemove", dragMove);
    window.removeEventListener("mouseup", stopDrag);
  };

  return (
    <>
      {openPanels.map((panel) => {
        const pos = panelPositions[panel.id] || { top: 50, left: 50 };
        const isComparison = Array.isArray(panel.data);
        const results = isComparison ? panel.data : [panel.data];
        const problemName = results[0]?.problemName || "";
        
        const getPanelTitle = (type) => { 
            return PANEL_TITLES[type] || 'Panel';
         };

        return (
          <div
            key={panel.id}
            className={`draggable-panel ${
              panel.type.startsWith("charts") ? "panel-charts" : "panel-table"
            }`}
            style={{
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              zIndex: dragInfo.current?.id === panel.id ? 1000 : 100,
            }}
          >
            <div
              className="panel-header"
              onMouseDown={(e) => startDrag(e, panel.id)}
            >
              <span className="panel-title">{getPanelTitle(panel.type)}</span>
              <button
                className="panel-close-btn"
                onClick={() => removePanel(panel.id)}
              >
                ✕
              </button>
            </div>
            <div className="panel-content">
              {panel.type === "table" && !isComparison && (
                 <IterationTable 
                   data={panel.data.iterationResults || []} 
                   problemName={panel.data.problemName} 
                   algorithmName={panel.data.algorithmName}
                 />
               )}
              {/* Zaktualizowane i nowe wykresy */}
              {panel.type === "charts-score" && <ScoreChart results={results} problemName={problemName} />}
              {panel.type === "charts-time" && <MetricChart results={results} dataKey="executionDurationMs" name="Czas iteracji (ms)" />}
              {panel.type === "charts-exploration" && <MetricChart results={results} dataKey="exploration" name="Miara Eksploracji" />}
              {panel.type === "charts-improvements" && <MetricChart results={results} dataKey="improvements" name="Liczba Popraw" />}
              {panel.type === "charts-relative-improvement" && <SpikeChart results={results} dataKey="relativeImprovement" name="Względna Poprawa (%)" />}
              {panel.type === "charts-stagnation" && <MetricChart results={results} dataKey="stagnation" name="Stagnacja" />}
            </div>
          </div>
        );
      })}
    </>
  );
}

