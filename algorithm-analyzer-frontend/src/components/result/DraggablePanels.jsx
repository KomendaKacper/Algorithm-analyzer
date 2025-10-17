import IterationTable from "./IterationTable";
import { MetricChart } from "./charts/MetricChart";
import { ScoreChart } from "./charts/ScoreChart";

export default function DraggablePanels({
  openPanels,
  panelPositions,
  setPanelPositions,
  removePanel,
}) {
  const startDrag = (e, id) => { /* ... bez zmian ... */ };

  return (
    <>
      {openPanels.map((panel) => {
        const pos = panelPositions[panel.id] || {};
        
        // --- KLUCZOWA ZMIANA: Sprawdzamy, czy dane to tablica (porównanie) czy obiekt (pojedynczy widok) ---
        const isComparison = Array.isArray(panel.data);
        const results = isComparison ? panel.data : [panel.data]; // Zawsze pracujemy na tablicy
        
        const problemName = results[0]?.problemName || "";

        const getPanelTitle = (type) => { /* ... bez zmian ... */ };

        return (
          <div key={panel.id} className={`draggable-panel ${panel.type.startsWith("charts") ? "panel-charts" : "panel-table"}`} style={{ top: pos.top, left: pos.left }}>
            <div className="panel-header" onMouseDown={(e) => startDrag(e, panel.id)}>
              <span className="panel-title">{getPanelTitle(panel.type)}</span>
              <button className="panel-close-btn" onClick={() => removePanel(panel.id)}>✕</button>
            </div>
            <div className="panel-content">

              {/* Tabela zawsze wyświetla dane dla jednego algorytmu */}
              {panel.type === "table" && !isComparison && (
                <IterationTable 
                  data={panel.data.iterationResults || []} 
                  problemName={panel.data.problemName} 
                  algorithmName={panel.data.algorithmName}
                />
              )}

              {/* Wykresy zawsze działają w trybie porównawczym (nawet dla jednego wyniku) */}
              {panel.type === "charts-score" && <ScoreChart results={results} problemName={problemName} />}
              {panel.type === "charts-time" && <MetricChart results={results} dataKey="executionDurationMs" name="Czas iteracji (ms)" />}
              {panel.type === "charts-diversity" && <MetricChart results={results} dataKey="diversity" name="Różnorodność" />}
              {panel.type === "charts-stagnation" && <MetricChart results={results} dataKey="stagnation" name="Stagnacja" />}

            </div>
          </div>
        );
      })}
    </>
  );
}