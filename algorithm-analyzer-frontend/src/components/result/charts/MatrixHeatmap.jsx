import React from 'react';

// Funkcja pomocnicza do normalizacji danych wejściowych do spójnego formatu
const normalizeMatrixData = (data, nodes) => {
  const normalized = {};
  if (!data) return normalized;

  // Sprawdź, czy dane są w formacie zagnieżdżonego obiektu (np. macierz odległości)
  if (nodes.every(node => data.hasOwnProperty(node))) {
    return data;
  }

  // Sprawdź, czy dane są w formacie płaskiej mapy (np. feromony "A->B": value)
  for (const key in data) {
    const parts = key.split('->');
    if (parts.length === 2) {
      const [from, to] = parts;
      if (!normalized[from]) {
        normalized[from] = {};
      }
      normalized[from][to] = data[key];
    }
  }
  return normalized;
};

export function MatrixHeatmap({ title, nodes, matrixData }) {
  if (!nodes || !matrixData) {
    return <div className="chart-placeholder">Brak danych macierzy do wyświetlenia.</div>;
  }

  const data = normalizeMatrixData(matrixData, nodes);

  // Znajdź min i max, ignorując wartości zerowe i diagonalne
  let min = Infinity;
  let max = -Infinity;
  nodes.forEach(rowNode => {
    nodes.forEach(colNode => {
      if (rowNode !== colNode) {
        const value = data[rowNode]?.[colNode];
        if (value != null && value > 0) {
          if (value < min) min = value;
          if (value > max) max = value;
        }
      }
    });
  });
  
  if (min === Infinity) { // Jeśli nie ma żadnych wartości > 0
    min = 0;
    max = 0;
  }

  // Funkcja mapująca wartość na kolor (od chłodnego do gorącego)
  const getColor = (value) => {
    if (value == null || value <= 0) return '#f8f9fa'; // Kolor dla braku danych
    if (max - min === 0) return '#fde047'; // Jeden kolor, jeśli wszystkie wartości są takie same
    
    const ratio = (value - min) / (max - min);
    // Gradient od niebieskiego (niski) przez żółty (średni) do czerwonego (wysoki)
    const hue = (1 - ratio) * 240; // 240 (niebieski) -> 0 (czerwony)
    return `hsl(${hue}, 90%, 60%)`;
  };

  return (
    <div className="matrix-heatmap-container">
      <h4>{title}</h4>
      <div className="matrix-grid" style={{ gridTemplateColumns: `auto repeat(${nodes.length}, 1fr)` }}>
        {/* Pusty róg */}
        <div className="matrix-cell header-cell"></div>
        {/* Nagłówki kolumn */}
        {nodes.map(node => <div key={`col-${node}`} className="matrix-cell header-cell">{node}</div>)}

        {/* Wiersze macierzy */}
        {nodes.map(rowNode => (
          <React.Fragment key={`row-${rowNode}`}>
            {/* Nagłówek wiersza */}
            <div className="matrix-cell header-cell">{rowNode}</div>
            {/* Komórki w wierszu */}
            {nodes.map(colNode => {
              const value = data[rowNode]?.[colNode];
              const isDiagonal = rowNode === colNode;

              return (
                <div
                  key={`${rowNode}-${colNode}`}
                  className={`matrix-cell ${isDiagonal ? 'diagonal' : ''}`}
                  style={{ backgroundColor: isDiagonal ? '#e9ecef' : getColor(value) }}
                  title={isDiagonal ? '-' : `${rowNode} → ${colNode}: ${value?.toFixed(4) ?? 'N/A'}`}
                >
                  {/* Opcjonalnie można wyświetlić wartość w komórce */}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
       <div className="heatmap-legend">
            <span>Min: {min.toFixed(3)}</span>
            <div className="gradient-bar"></div>
            <span>Max: {max.toFixed(3)}</span>
        </div>
    </div>
  );
}
