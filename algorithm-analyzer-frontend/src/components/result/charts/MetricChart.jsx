// src/components/result/charts/MetricChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Iteracja: ${label}`}</p>
        {payload.map((pld, index) => {
          let value = pld.value;
          if (typeof value === 'number') {
            // Jeśli liczba całkowita to nie dodajemy miejsc po przecinku, jeśli float to max 4
            value = Number.isInteger(value) ? value : parseFloat(value.toFixed(4));
          } else if (value == null) {
            value = 'N/A';
          }
          return (
            <p key={`item-${index}`} className="tooltip-item" style={{ color: pld.stroke }}>
              {`${pld.name}: ${value}`}
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
    return <div className="chart-placeholder">Brak wyników do wyświetlenia.</div>;
  }

  // Sprawdzamy czy w ogóle mamy dane iteracji
  const firstResultIter = results[0]?.iterationResults?.[0];
  if (!firstResultIter) {
      return <div className="chart-placeholder">Brak danych iteracji dla tego algorytmu.</div>;
  }

  // Funkcja pomocnicza do bezpiecznego wyciągania wartości
  const getValue = (iteration, key) => {
      if (!iteration) return null;
      // Priorytet 1: Dane specyficzne (np. temperatura, feromony)
      if (iteration.specificMetrics && iteration.specificMetrics.hasOwnProperty(key)) {
          return iteration.specificMetrics[key];
      }
      // Priorytet 2: Dane główne (np. executionDurationMs)
      if (iteration.hasOwnProperty(key)) {
          return iteration[key];
      }
      return null;
  };

  const maxIterations = Math.max(...results.map(r => r.iterationResults?.length || 0));
  const chartData = [];

  for (let i = 0; i < maxIterations; i++) {
    const dataPoint = { iteration: i };
    let hasDataInRow = false;

    results.forEach(result => {
      const iteration = result.iterationResults?.[i];
      const val = getValue(iteration, dataKey);

      // Renderujemy tylko liczby. Obiekty (np. mapy) są ignorowane.
      if (typeof val === 'number') {
          dataPoint[result.algorithmName] = val;
          hasDataInRow = true;
      } else {
          dataPoint[result.algorithmName] = null;
      }
    });

    // Dodajemy punkt tylko jeśli przynajmniej jeden algorytm ma dane (lub to start)
    if (hasDataInRow || i === 0) {
        chartData.push(dataPoint);
    }
  }

  if (chartData.length === 0) {
      return <div className="chart-placeholder">Metryka "{name}" nie zawiera danych liczbowych do wykreślenia.</div>;
  }

  return (
    <div className="chart-container">
      <h4>{name}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 30, right: 30, left: 50, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis label={{ value: name, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
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
                connectNulls={true} 
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}