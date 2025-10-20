import React from 'react';

const normalizeMatrixData = (data, nodes) => {
  const normalized = {};
  if (!data || !nodes) return normalized;

  if (nodes.every(node => data.hasOwnProperty(node))) {
    return data;
  }

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
  if (!nodes || !matrixData || nodes.length === 0) {
    return <div className="chart-placeholder">Brak danych macierzy do wyświetlenia.</div>;
  }

  const data = normalizeMatrixData(matrixData, nodes);

  let min = Infinity;
  let max = -Infinity;
  nodes.forEach(rowNode => {
    nodes.forEach(colNode => {
      if (rowNode !== colNode) {
        const value = data[rowNode]?.[colNode];
        if (value != null && value > 0 && Number.isFinite(value)) {
          if (value < min) min = value;
          if (value > max) max = value;
        }
      }
    });
  });
  
  if (!Number.isFinite(min)) {
    min = 0;
    max = 0;
  }

  const getColor = (value) => {
    if (value == null || value <= 0 || !Number.isFinite(value)) return '#f8f9fa';
    if (max - min === 0) return '#fde047'; 
    
    const ratio = (value - min) / (max - min);
    const hue = (1 - ratio) * 240;
    return `hsl(${hue}, 90%, 60%)`;
  };

  return (
    <div className="matrix-heatmap-container">
      <h4>{title}</h4>
      <div className="matrix-grid-wrapper"> {/* <<< NOWY WRAPPER DO PRZEWIJANIA */}
        <div className="matrix-grid" style={{ gridTemplateColumns: `auto repeat(${nodes.length}, 1fr)` }}>
          <div className="matrix-cell header-cell"></div>
          {nodes.map(node => <div key={`col-${node}`} className="matrix-cell header-cell">{node}</div>)}

          {nodes.map(rowNode => (
            <React.Fragment key={`row-${rowNode}`}>
              <div className="matrix-cell header-cell">{rowNode}</div>
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
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
       <div className="heatmap-legend">
            <span>Min: {min.toFixed(3)}</span>
            <div className="gradient-bar"></div>
            <span>Max: {max.toFixed(3)}</span>
        </div>
    </div>
  );
}

