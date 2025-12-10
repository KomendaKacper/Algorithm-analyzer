// src/components/result/charts/ScoreChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Iteracja: ${label}`}</p>
        {payload.map((pld, index) => (
          <p key={`item-${index}`} className="tooltip-item" style={{ color: pld.stroke }}>
            {`${pld.name}: ${typeof pld.value === 'number' ? pld.value.toFixed(2) : pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ScoreChart({ results }) {
  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak danych do wyświetlenia.</div>;
  }

  const maxIterations = Math.max(...results.map(r => r.iterationResults?.length || 0));
  // Wykrywanie czy to problem maksymalizacji (np. plecakowy) czy minimalizacji (TSP)
  const isMaximization = results[0].problemName && !results[0].problemName.includes("Traveling Salesman"); 

  const chartData = [];
  for (let i = 0; i < maxIterations; i++) {
    const dataPoint = { iteration: i };
    results.forEach(result => {
      const iteration = result.iterationResults?.[i];
      if (iteration) {
        dataPoint[result.algorithmName] = iteration.bestScore;
      }
    });
    chartData.push(dataPoint);
  }

  return (
    <div className="chart-container">
      <h4>Zbieżność Wyniku (Best Score)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 30, right: 30, left: 50, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis 
            label={{ value: 'Wynik', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            domain={['auto', 'auto']}
            padding={{ top: 20, bottom: 20 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
          {results.map((result, index) => {
            const color = CHART_COLORS_PALETTE[index % CHART_COLORS_PALETTE.length];
            return (
              <Line
                key={result.algorithmName}
                type="monotone"
                dataKey={result.algorithmName}
                name={result.algorithmName}
                stroke={color.line}
                strokeWidth={2.5}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}