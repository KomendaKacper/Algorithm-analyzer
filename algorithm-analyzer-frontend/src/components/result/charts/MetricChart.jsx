import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from './chartColors';

// --- NOWA FUNKCJA POMOCNICZA: Do bezpiecznego formatowania wartości ---
const tooltipFormatter = (value) => {
  if (value == null) return 'N/A';
  if (typeof value === 'number') return value.toFixed(3);
  if (typeof value === 'object') return JSON.stringify(value); // Zabezpieczenie przed crashowaniem
  return String(value);
};


export function MetricChart({ results, dataKey, name }) {
  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak danych do wyświetlenia.</div>;
  }

  const firstResult = results[0]?.iterationResults?.[0];
  if (!firstResult) {
      return <div className="chart-placeholder">Brak wyników iteracji.</div>;
  }

  const isSpecificMetric = firstResult.specificMetrics?.hasOwnProperty(dataKey);
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
        const value = isSpecificMetric 
            ? iteration.specificMetrics?.[dataKey] 
            : iteration[dataKey];
        dataPoint[result.algorithmName] = value;
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
          {/* --- ZMIANA: Użycie bezpiecznego formattera --- */}
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={(label) => `Iteracja: ${label}`}
          />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
          {results.map((result, index) => (
            <Line
              key={result.algorithmName}
              type="monotone"
              dataKey={result.algorithmName}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              name={result.algorithmName}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
