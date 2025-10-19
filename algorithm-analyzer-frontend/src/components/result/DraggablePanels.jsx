import React, { useRef } from "react";
import IterationTable from "./IterationTable";
import { MetricChart } from "./charts/MetricChart";
import { ScoreChart } from "./charts/ScoreChart";
import { SpikeChart } from "./charts/SpikeChart";
import { MatrixHeatmap } from "./charts/MatrixHeatmap";
import { AnimatedMatrixHeatmap } from "./charts/AnimatedMatrixHeatmap"; // --- NOWY IMPORT ---

const PANEL_TITLES = {
  table: 'Tabela Iteracji',
  'charts-score': 'Wykres: Jakość / Trajektoria',
  'charts-time': 'Wykres: Czas wykonania',
  'charts-exploration': 'Wykres: Miara Eksploracji',
  'charts-improvements': 'Wykres: Częstotliwość Poprawy',
  'charts-relative-improvement': 'Wykres: Skoki Poprawy',
  'charts-stagnation': 'Wykres: Stagnacja',
  // --- NOWY TYTUŁ ---
  'animated-matrix-pheromones': 'Animacja: Ewolucja Feromonów'
};

export default function DraggablePanels({
  openPanels,
  panelPositions,
  setPanelPositions,
  removePanel,
  toggleMinimize,
}) {
  const dragInfo = useRef(null);

  const startDrag = (e, id) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    const panelElement = e.currentTarget.closest(".draggable-panel");
    const rect = panelElement.getBoundingClientRect();
    dragInfo.current = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    window.addEventListener("mousemove", dragMove);
    window.addEventListener("mouseup", stopDrag);
  };

  const dragMove = (e) => {
    if (!dragInfo.current) return;
    const { id, offsetX, offsetY } = dragInfo.current;
    const newTop = e.clientY - offsetY;
    const newLeft = e.clientX - offsetX;
    setPanelPositions((prev) => ({ ...prev, [id]: { top: newTop, left: newLeft } }));
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
        
        const getPanelTitle = (type) => { 
            if (PANEL_TITLES[type]) return PANEL_TITLES[type];
            if (type.startsWith('matrix-')) {
                return panel.data?.title || 'Macierz';
            }
            if (type.startsWith('charts-specific-')) {
                const key = type.replace('charts-specific-', '');
                const label = results[0]?.specificMetricLabels?.[key] || key;
                return `Wykres: ${label}`;
            }
            return 'Panel';
        };

        return (
          <div
            key={panel.id}
            className={`draggable-panel ${panel.type.startsWith("charts") || panel.type.startsWith("matrix") || panel.type.startsWith("animated") ? "panel-charts" : "panel-table"} ${panel.minimized ? "minimized" : ""}`}
            style={{ top: `${pos.top}px`, left: `${pos.left}px`, zIndex: dragInfo.current?.id === panel.id ? 101 : 100 }}
          >
            <div className="panel-header" onMouseDown={(e) => startDrag(e, panel.id)}>
              <span className="panel-title">{getPanelTitle(panel.type)}</span>
              <div className="panel-header-buttons">
                <button onClick={() => toggleMinimize(panel.id)} className="panel-minimize-button" title={panel.minimized ? "Rozwiń" : "Zwiń"}>
                  {panel.minimized ? '⤢' : '—'}
                </button>
                <button className="panel-close-btn" onClick={() => removePanel(panel.id)}>✕</button>
              </div>
            </div>
            {!panel.minimized && (
              <div className="panel-content">
                {panel.type === "table" && !isComparison && <IterationTable data={panel.data.iterationResults || []} algorithmName={panel.data.algorithmName}/>}
                
                {panel.type === "charts-score" && <ScoreChart results={results} />}
                {panel.type === "charts-time" && <MetricChart results={results} dataKey="executionDurationMs" name="Czas iteracji (ms)" />}
                {panel.type === "charts-exploration" && <MetricChart results={results} dataKey="exploration" name="Miara Eksploracji" />}
                {panel.type === "charts-improvements" && <MetricChart results={results} dataKey="improvements" name="Liczba Popraw" />}
                {panel.type === "charts-relative-improvement" && <SpikeChart results={results} dataKey="relativeImprovement" name="Względna Poprawa (%)" />}
                {panel.type === "charts-stagnation" && <MetricChart results={results} dataKey="stagnation" name="Stagnacja" />}
                
                {panel.type.startsWith('charts-specific-') && (
                    <MetricChart 
                        results={results} 
                        dataKey={panel.type.replace('charts-specific-', '')}
                        name={getPanelTitle(panel.type).replace('Wykres: ', '')} 
                    />
                )}
                {panel.type.startsWith('matrix-') && !panel.type.startsWith('animated-matrix') && (
                    <MatrixHeatmap 
                        title={panel.data.title}
                        nodes={panel.data.nodes}
                        matrixData={panel.data.matrixData}
                    />
                )}
                {/* --- NOWA LOGIKA: Renderowanie animowanej mapy ciepła --- */}
                {panel.type === 'animated-matrix-pheromones' && (
                    <AnimatedMatrixHeatmap results={results} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

