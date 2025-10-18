import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from './chartColors';

const problemConfig = {
  "Traveling Salesman Problem (TSP)": { isMaximization: false },
  "Knapsack Problem": { isMaximization: true },
  default: { isMaximization: true }
};

// Funkcja pomocnicza do obliczania regresji liniowej
const calculateLinearRegression = (data) => {
  const n = data.length;
  if (n < 2) return { m: 0, b: data[0]?.y || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  data.forEach(point => {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  });

  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  return { m, b };
};

export function ScoreChart({ results, problemName }) {
  const [showTrendLine, setShowTrendLine] = useState(false);

  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak danych do wyświetlenia.</div>;
  }

  const config = problemConfig[problemName] || problemConfig.default;
  
  const maxIterations = Math.max(...results.map(r => r.iterationResults?.length || 0));
  const chartData = [];

  // 1. Przygotuj dane bazowe (tylko najlepszy wynik)
  for (let i = 0; i < maxIterations; i++) {
    const dataPoint = { iteration: i };
    results.forEach(result => {
      const iteration = result.iterationResults?.[i];
      if (iteration && iteration.bestScore != null) {
        dataPoint[`${result.algorithmName} (Najlepszy)`] = iteration.bestScore;
      }
    });
    chartData.push(dataPoint);
  }

  // 2. Jeśli linia trendu jest włączona, oblicz i dodaj jej dane
  if (showTrendLine) {
    results.forEach(result => {
      const bestScoreKey = `${result.algorithmName} (Najlepszy)`;
      const trendLineKey = `${result.algorithmName} (Trend)`;

      const dataForRegression = chartData
        .map((d, i) => ({ x: i, y: d[bestScoreKey] }))
        .filter(p => p.y != null && isFinite(p.y));

      if (dataForRegression.length > 1) {
          const { m, b } = calculateLinearRegression(dataForRegression);
          chartData.forEach((d, i) => {
            // Unikaj rysowania trendu dla brakujących punktów
            if(d[bestScoreKey] != null) {
              d[trendLineKey] = m * i + b;
            }
          });
      }
    });
  }

  // 3. Skonfiguruj linie do narysowania
  const lineConfigs = [];
  results.forEach((result, index) => {
    const baseColor = CHART_COLORS[index % CHART_COLORS.length];
    const bestScoreKey = `${result.algorithmName} (Najlepszy)`;
    lineConfigs.push({ dataKey: bestScoreKey, color: baseColor, strokeWidth: 3 });

    if (showTrendLine) {
      const trendLineKey = `${result.algorithmName} (Trend)`;
      lineConfigs.push({
        dataKey: trendLineKey,
        color: baseColor,
        strokeWidth: 2,
        strokeDasharray: "8 4",
        strokeOpacity: 0.8,
        name: trendLineKey // Dodajemy nazwę do legendy
      });
    }
  });

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4>Najlepszy wynik w kolejnych iteracjach</h4>
        <button className="chart-toggle-button" onClick={() => setShowTrendLine(prev => !prev)}>
          {showTrendLine ? "🙈 Ukryj linię trendu" : "📈 Pokaż linię trendu"}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis 
            label={{ value: 'Wynik', angle: -90, position: 'insideLeft' }} 
            domain={['auto', 'auto']} 
            reversed={!config.isMaximization}
          />
          <Tooltip
            formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(3) : value,
                name
            ]}
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
              name={line.name || line.dataKey} // Użyj `name` dla legendy, jeśli zdefiniowane
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

