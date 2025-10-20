import React, { useRef, useCallback } from "react";
import IterationTable from "./IterationTable";
import { MetricChart } from "./charts/MetricChart";
import { ScoreChart } from "./charts/ScoreChart";
import { SpikeChart } from "./charts/SpikeChart";
import { MatrixHeatmap } from "./charts/MatrixHeatmap";
import { AnimatedMatrixHeatmap } from "./charts/AnimatedMatrixHeatmap";

const PANEL_TITLES = {
  table: 'Tabela Iteracji',
  'charts-score': 'Wykres: Jakość / Trajektoria',
  'charts-time': 'Wykres: Czas wykonania',
  'charts-exploration': 'Wykres: Miara Eksploracji',
  'charts-improvements': 'Wykres: Częstotliwość Poprawy',
  'charts-relative-improvement': 'Wykres: Skoki Poprawy',
  'charts-stagnation': 'Wykres: Stagnacja',
  'animated-matrix-pheromones': 'Animacja: Ewolucja Feromonów'
};

export default function DraggablePanels({
  openPanels,
  panelPositions,
  setPanelPositions,
  removePanel,
  toggleMinimize,
}) {
  const interactionInfo = useRef(null);
  const panelRefs = useRef({});

  const handleInteractionStart = useCallback((e, id, type) => {
    // Ignoruj kliknięcia na przyciski w nagłówku
    if (e.target.closest('button')) return;
    e.preventDefault();
    e.stopPropagation();

    const panelElement = panelRefs.current[id];
    if (!panelElement) return;

    // Zapisz pozycję startową i wymiary z naszego stanu w React
    const startPos = panelPositions[id];
    
    interactionInfo.current = {
      id,
      type, // 'drag' or 'resize'
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: startPos.left,
      initialTop: startPos.top,
      initialWidth: startPos.width,
      initialHeight: startPos.height,
    };
    
    panelElement.classList.add('dragging');

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [panelPositions]);

  const handleMouseMove = useCallback((e) => {
    if (!interactionInfo.current) return;

    const { id, type, startX, startY, initialLeft, initialTop, initialWidth, initialHeight } = interactionInfo.current;
    const panelElement = panelRefs.current[id];
    if (!panelElement) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // --- KLUCZ DO PŁYNNOŚCI: Manipulujemy transform, a nie top/left ---
    if (type === 'drag') {
      panelElement.style.transform = `translate(${dx}px, ${dy}px)`;
    } else if (type === 'resize') {
      const newWidth = Math.max(350, initialWidth + dx);
      const newHeight = Math.max(200, initialHeight + dy);
      panelElement.style.width = `${newWidth}px`;
      panelElement.style.height = `${newHeight}px`;
    }
  }, []);
  
  const handleMouseUp = useCallback((e) => {
    if (!interactionInfo.current) return;

    const { id, type, startX, startY, initialLeft, initialTop, initialWidth, initialHeight } = interactionInfo.current;
    const panelElement = panelRefs.current[id];
    if (!panelElement) return;
    
    panelElement.classList.remove('dragging');

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // --- AKTUALIZUJEMY STAN REACTA TYLKO RAZ, PO ZAKOŃCZENIU AKCJI ---
    setPanelPositions(prev => {
      const newPositions = { ...prev };
      if (type === 'drag') {
        newPositions[id] = { ...prev[id], top: initialTop + dy, left: initialLeft + dx };
      } else if (type === 'resize') {
        const newWidth = Math.max(350, initialWidth + dx);
        const newHeight = Math.max(200, initialHeight + dy);
        newPositions[id] = { ...prev[id], width: newWidth, height: newHeight };
      }
      return newPositions;
    });
    
    // Resetujemy style inline po aktualizacji stanu
    panelElement.style.transform = '';

    interactionInfo.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [setPanelPositions]);

  return (
    <>
      {openPanels.map((panel) => {
        const pos = panelPositions[panel.id] || { top: 50, left: 50, width: 800, height: 500 };
        const isComparison = Array.isArray(panel.data);
        const results = isComparison ? panel.data : [panel.data];
        
        const getPanelTitle = (type) => { 
            if (PANEL_TITLES[type]) return PANEL_TITLES[type];
            if (type.startsWith('matrix-')) return panel.data?.title || 'Macierz';
            if (type.startsWith('charts-specific-')) {
                const key = type.replace('charts-specific-', '');
                return `Wykres: ${results[0]?.specificMetricLabels?.[key] || key}`;
            }
            return 'Panel';
        };

        return (
          <div
            key={panel.id}
            ref={el => panelRefs.current[panel.id] = el}
            className={`draggable-panel ${panel.type.startsWith("charts") || panel.type.startsWith("matrix") || panel.type.startsWith("animated") ? "panel-charts" : "panel-table"} ${panel.minimized ? "minimized" : ""}`}
            style={{ 
                top: `${pos.top}px`, 
                left: `${pos.left}px`,
                width: `${panel.minimized ? 350 : pos.width}px`,
                height: `${panel.minimized ? 'auto' : pos.height}px`,
            }}
          >
            <div className="panel-header" onMouseDown={(e) => handleInteractionStart(e, panel.id, 'drag')}>
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
                {panel.type.startsWith('charts-specific-') && <MetricChart results={results} dataKey={panel.type.replace('charts-specific-', '')} name={getPanelTitle(panel.type).replace('Wykres: ', '')} />}
                {panel.type.startsWith('matrix-') && !panel.type.startsWith('animated-matrix') && <MatrixHeatmap title={panel.data.title} nodes={panel.data.nodes} matrixData={panel.data.matrixData} />}
                {panel.type === 'animated-matrix-pheromones' && <AnimatedMatrixHeatmap results={results} />}
              </div>
            )}
            {!panel.minimized && (
                <div 
                    className="resizable-handle" 
                    onMouseDown={(e) => handleInteractionStart(e, panel.id, 'resize')}
                ></div>
            )}
          </div>
        );
      })}
    </>
  );
}

