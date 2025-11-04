import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors';

// Kustomowy Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Iteracja : ${label}`}</p>
        {payload.map((pld, index) => (
          <p key={`item-${index}`} className="tooltip-item" style={{ color: pld.stroke }}>
            {`${pld.name} : ${pld.value.toFixed(2)}`}
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
  const isMaximization = results[0].problemName !== "Traveling Salesman Problem (TSP)";

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
      <h4>Zbieżność Wyniku w Kolejnych Iteracjach</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis 
            label={{ value: 'Najlepszy Wynik', angle: -90, position: 'insideLeft' }}
            domain={['auto', 'auto']}
            padding={{ top: 20, bottom: 20 }}
            reversed={!isMaximization}
            tickFormatter={(tick) => tick.toFixed(0)}
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
                name={`${result.algorithmName} (Najlepszy)`}
                stroke={color.line} // Używamy koloru linii z palety
                strokeWidth={2.5}
                dot={false}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

