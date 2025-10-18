import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from './chartColors'; // Załóżmy, że masz zdefiniowane kolory

export function MetricChart({ results, dataKey, name }) {
  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak danych do wyświetlenia.</div>;
  }

  // Sprawdź, czy dane dla tego klucza w ogóle istnieją
  const firstResult = results[0]?.iterationResults?.[0];
  if (!firstResult) {
      return <div className="chart-placeholder">Brak wyników iteracji.</div>;
  }

  // --- KLUCZOWA ZMIANA: Sprawdzamy, gdzie znajduje się klucz danych ---
  const isSpecificMetric = firstResult.specificMetrics?.hasOwnProperty(dataKey);
  if (!isSpecificMetric && !firstResult.hasOwnProperty(dataKey)) {
      return <div className="chart-placeholder">Brak danych dla metryki: {name}.</div>;
  }

  // Przygotuj dane do wykresu - wyciągnij maksymalną długość iteracji
  const maxIterations = Math.max(...results.map(r => r.iterationResults?.length || 0));
  const chartData = [];

  for (let i = 0; i < maxIterations; i++) {
    const dataPoint = { iteration: i };
    results.forEach(result => {
      if (result.iterationResults && result.iterationResults[i]) {
        const iteration = result.iterationResults[i];
        
        // --- KLUCZOWA ZMIANA: Uniwersalny sposób dostępu do danych ---
        // Szukaj klucza najpierw w specificMetrics, a jeśli go tam nie ma, to na głównym poziomie.
        const value = isSpecificMetric 
            ? iteration.specificMetrics?.[dataKey] 
            : iteration[dataKey];
            
        // Używamy unikalnej nazwy algorytmu (np. "ACO [#1]") jako klucza
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
          <Tooltip
            formatter={(value) => typeof value === 'number' ? value.toFixed(3) : value}
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
