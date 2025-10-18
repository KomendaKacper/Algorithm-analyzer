import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from './chartColors';

// Nowy komponent do wizualizacji "skoków" poprawy
export function SpikeChart({ results, dataKey, name }) {
  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak danych do wyświetlenia.</div>;
  }

  const firstResult = results[0]?.iterationResults?.[0];
  if (!firstResult?.specificMetrics?.hasOwnProperty(dataKey)) {
      return <div className="chart-placeholder">Brak danych dla metryki: {name}.</div>;
  }
  
  const maxIterations = Math.max(...results.map(r => r.iterationResults?.length || 0));
  const chartData = [];

  for (let i = 0; i < maxIterations; i++) {
    const dataPoint = { iteration: i };
    results.forEach(result => {
      const iteration = result.iterationResults?.[i];
      if (iteration && iteration.specificMetrics?.[dataKey] > 0) {
        // Mnożymy x100, aby wyświetlić w procentach
        dataPoint[result.algorithmName] = iteration.specificMetrics[dataKey] * 100;
      }
    });
    chartData.push(dataPoint);
  }
  
  // Filtrujemy dane, aby pokazać tylko iteracje, w których była jakakolwiek poprawa
  const filteredData = chartData.filter(d => Object.keys(d).length > 1);

  return (
    <div className="chart-container">
      <h4>{name} w momentach poprawy wyniku</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={filteredData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis label={{ value: name, angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value) => typeof value === 'number' ? `${value.toFixed(2)}%` : value}
            labelFormatter={(label) => `Iteracja: ${label}`}
          />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
          {results.map((result, index) => (
            <Bar
              key={result.algorithmName}
              dataKey={result.algorithmName}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              name={result.algorithmName}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
