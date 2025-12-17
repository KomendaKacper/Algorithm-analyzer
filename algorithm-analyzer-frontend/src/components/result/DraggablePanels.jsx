import React, { useRef, useCallback } from "react";
import IterationTable from "./IterationTable";
import { MetricChart } from "./charts/MetricChart";
import { ScoreChart } from "./charts/ScoreChart";
import { SpikeChart } from "./charts/SpikeChart";
import { MatrixHeatmap } from "./charts/MatrixHeatmap";
import { AnimatedMatrixHeatmap } from "./charts/AnimatedMatrixHeatmap";
import { StabilityChart } from "./charts/StabilityChart"; 
import { ScatterPlotChart } from "./charts/ScatterPlotChart";
import { ObjectMetricChart } from "./charts/ObjectMetricChart";

const PANEL_TITLES = {
  table: 'Tabela Iteracji',
  'charts-score': 'Wykres: Zbieżność Wyniku',
  'charts-time': 'Wykres: Czas wykonania',
  'charts-improvements': 'Wykres: Częstotliwość Poprawy',
  'charts-relative-improvement': 'Wykres: Skoki Poprawy (%)',
  'charts-stagnation': 'Wykres: Stagnacja',
  'animated-matrix-pheromones': 'Animacja: Ewolucja Feromonów',
  'stability-chart': 'Analiza: Stabilność Wyników',
  'scatter-plot': 'Analiza: Kompromis Jakość vs. Czas'
};

export default function DraggablePanels({
  openPanels,
  panelPositions,
  setPanelPositions,
  removePanel,
  toggleMinimize,
  scatterPlotData,
}) {
  const interactionInfo = useRef(null);
  const panelRefs = useRef({});

  const handleInteractionStart = useCallback((e, id, type) => {
    if (e.target.closest('button')) return; // Nie uruchamiaj przeciągania na przyciskach
    e.preventDefault();
    e.stopPropagation();
    const panelElement = panelRefs.current[id];
    if (!panelElement) return;
    const startPos = panelPositions[id] || { top: 50, left: 50, width: 600, height: 400 };
    interactionInfo.current = { id, type, startX: e.clientX, startY: e.clientY, initialLeft: startPos.left, initialTop: startPos.top, initialWidth: startPos.width, initialHeight: startPos.height };
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

    if (type === 'drag') {
      panelElement.style.transform = `translate(${dx}px, ${dy}px)`;
    } else if (type === 'resize') {
      panelElement.style.width = `${Math.max(350, initialWidth + dx)}px`;
      panelElement.style.height = `${Math.max(200, initialHeight + dy)}px`;
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
        
        // Logika tytułów
        const getPanelTitle = (type) => { 
            if (PANEL_TITLES[type]) return PANEL_TITLES[type];
            if (type.startsWith('matrix-')) return panel.data?.title || 'Macierz';
            
            // Obsługa dynamicznych wykresów
            if (type.startsWith('charts-specific-')) {
                const key = type.replace('charts-specific-', '');
                // Próbujemy pobrać ładną nazwę z pierwszego wyniku
                const label = results[0]?.specificMetricLabels?.[key] || key;
                return `Wykres: ${label}`;
            }
            return 'Panel';
        };

        const panelTitle = getPanelTitle(panel.type);

        return (
          <div
            key={panel.id}
            ref={el => panelRefs.current[panel.id] = el}
            className={`draggable-panel ${panel.type.includes('chart') || panel.type.includes('matrix') || panel.type.includes('plot') ? "panel-charts" : "panel-table"} ${panel.minimized ? "minimized" : ""}`}
            style={{ 
                top: `${pos.top}px`, 
                left: `${pos.left}px`,
                width: `${panel.minimized ? 350 : pos.width}px`,
                height: `${panel.minimized ? 'auto' : pos.height}px`,
            }}
          >
            <div className="panel-header" onMouseDown={(e) => handleInteractionStart(e, panel.id, 'drag')}>
              <span className="panel-title">{panelTitle}</span>
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
                {panel.type === "charts-improvements" && <MetricChart results={results} dataKey="improvements" name="Liczba Popraw" />}
                {panel.type === "charts-relative-improvement" && <SpikeChart results={results} dataKey="relativeImprovement" name="Względna Poprawa (%)" />}
                {panel.type === "charts-stagnation" && <MetricChart results={results} dataKey="stagnation" name="Stagnacja" />}
                
                {/* Dynamiczne wykresy specyficzne dla algorytmu */}
                {panel.type.startsWith('charts-specific-') && (
                    (() => {
                        const key = panel.type.replace('charts-specific-', '');
                        const firstVal = results[0]?.iterationResults?.[0]?.specificMetrics?.[key];
                        const isObject = typeof firstVal === 'object' && firstVal !== null;

                        if (isObject) {
                             return <ObjectMetricChart 
                                results={results} 
                                dataKey={key} 
                                name={panelTitle.replace('Wykres: ', '')} 
                            />
                        } else {
                            return <MetricChart 
                                results={results} 
                                dataKey={key} 
                                name={panelTitle.replace('Wykres: ', '')} 
                            />
                        }
                    })()
                )}

                {/* Macierze */}
                {panel.type.startsWith('matrix-') && !panel.type.startsWith('animated-matrix') && <MatrixHeatmap title={panel.data.title} nodes={panel.data.nodes} matrixData={panel.data.matrixData} />}
                {panel.type === 'animated-matrix-pheromones' && <AnimatedMatrixHeatmap results={results} />}

                {/* Statystyki */}
                {panel.type === 'stability-chart' && <StabilityChart results={panel.data} />}
                {panel.type === 'scatter-plot' && <ScatterPlotChart data={scatterPlotData} />}
              </div>
            )}
            {!panel.minimized && (
                <div className="resizable-handle" onMouseDown={(e) => handleInteractionStart(e, panel.id, 'resize')}></div>
            )}
          </div>
        );
      })}
    </>
  );
}