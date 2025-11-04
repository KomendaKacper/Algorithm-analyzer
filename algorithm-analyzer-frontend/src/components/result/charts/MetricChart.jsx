import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors'; // --- ZMIANA: Importujemy nową paletę ---

// --- Kustomowy Tooltip (zamiast domyślnego formattera) ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Iteracja : ${label}`}</p>
        {payload.map((pld, index) => {
          let value = pld.value;
          if (typeof value === 'number') {
            value = value.toFixed(3);
          } else if (value != null) {
            value = String(value); // Bezpieczne stringowanie
          } else {
            value = 'N/A';
          }
          return (
            <p key={`item-${index}`} className="tooltip-item" style={{ color: pld.stroke }}>
              {`${pld.name} : ${value}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};


export function MetricChart({ results, dataKey, name }) {
  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak danych do wyświetlenia.</div>;
  }

  const firstResult = results[0]?.iterationResults?.[0];
  if (!firstResult) {
     return <div className="chart-placeholder">Brak wyników iteracji.</div>;
  }

  const isSpecificMetric = results.some(r => r.iterationResults?.[0]?.specificMetrics?.hasOwnProperty(dataKey));
  
  if (!isSpecificMetric && !firstResult.hasOwnProperty(dataKey)) {
     return <div className="chart-placeholder">Brak danych dla metryki: {name}.</div>;
  }

  const maxIterations = Math.max(...results.map(r => r.iterationResults?.length || 0));
  const chartData = [];

  for (let i = 0; i < maxIterations; i++) {
    const dataPoint = { iteration: i };
    results.forEach(result => {
      const iteration = result.iterationResults?.[i];
      if (iteration) {
        let value;
        if (iteration.specificMetrics?.hasOwnProperty(dataKey)) {
          value = iteration.specificMetrics[dataKey];
        } else if (iteration.hasOwnProperty(dataKey)) {
          value = iteration[dataKey];
        }
        
        if (typeof value === 'object' && value !== null) {
            dataPoint[result.algorithmName] = null; 
        } else {
            dataPoint[result.algorithmName] = value;
        }
      }
    });
    chartData.push(dataPoint);
  }

  return (
    <div className="chart-container">
      <h4>{name} w kolejnych iteracjach</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis label={{ value: name, angle: -90, position: 'insideLeft' }} />
          <Tooltip
            content={<CustomTooltip />} 
            labelFormatter={(label) => `Iteracja: ${label}`}
          />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
          {results.map((result, index) => {
            const color = CHART_COLORS_PALETTE[index % CHART_COLORS_PALETTE.length];
            return (
              <Line
                key={result.algorithmName}
                type="monotone"
                dataKey={result.algorithmName}
                stroke={color.line}
                strokeWidth={2}
                dot={false}
                name={result.algorithmName}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

