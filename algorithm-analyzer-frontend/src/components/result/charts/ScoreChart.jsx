import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from './chartColors';

// Ulepszony komponent ScoreChart do wizualizacji jakości populacji / trajektorii
export function ScoreChart({ results, problemName }) {
  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak danych do wyświetlenia.</div>;
  }

  const isMaximization = results[0]?.problemName?.toLowerCase().includes("knapsack");
  
  const maxIterations = Math.max(...results.map(r => r.iterationResults?.length || 0));
  const chartData = [];

  const dataKeys = new Set(['bestScore']);
  results.forEach(r => {
    if (r.iterationResults?.[0]?.averageScore) dataKeys.add('averageScore');
    if (r.iterationResults?.[0]?.worstScore) dataKeys.add('worstScore');
    if (r.iterationResults?.[0]?.currentScore) dataKeys.add('currentScore');
  });

  for (let i = 0; i < maxIterations; i++) {
    const dataPoint = { iteration: i };
    results.forEach(result => {
      const iteration = result.iterationResults?.[i];
      if (iteration) {
        if(dataKeys.has('bestScore')) dataPoint[`${result.algorithmName} (Najlepszy)`] = iteration.bestScore;
        if(dataKeys.has('averageScore')) dataPoint[`${result.algorithmName} (Średni)`] = iteration.averageScore;
        if(dataKeys.has('worstScore')) dataPoint[`${result.algorithmName} (Najgorszy)`] = iteration.worstScore;
        if(dataKeys.has('currentScore')) dataPoint[`${result.algorithmName} (Bieżący)`] = iteration.currentScore;
      }
    });
    chartData.push(dataPoint);
  }

  const lineConfigs = [];
  results.forEach((result, index) => {
    const baseColor = CHART_COLORS[index % CHART_COLORS.length];
    if(dataKeys.has('bestScore')) lineConfigs.push({ dataKey: `${result.algorithmName} (Najlepszy)`, color: baseColor, strokeWidth: 3 });
    if(dataKeys.has('currentScore')) lineConfigs.push({ dataKey: `${result.algorithmName} (Bieżący)`, color: baseColor, strokeDasharray: "5 5" });
    if(dataKeys.has('averageScore')) lineConfigs.push({ dataKey: `${result.algorithmName} (Średni)`, color: baseColor, strokeDasharray: "10 5" });
    if(dataKeys.has('worstScore')) lineConfigs.push({ dataKey: `${result.algorithmName} (Najgorszy)`, color: baseColor, strokeOpacity: 0.6, strokeDasharray: "2 10" });
  });

  return (
    <div className="chart-container">
      <h4>Jakość rozwiązań w kolejnych iteracjach</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis label={{ value: 'Wynik', angle: -90, position: 'insideLeft' }} domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value) => typeof value === 'number' ? value.toFixed(3) : value}
            labelFormatter={(label) => `Iteracja: ${label}`}
          />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
          {lineConfigs.map(line => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray || "0"}
              strokeOpacity={line.strokeOpacity || 1}
              dot={false}
              name={line.dataKey}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
