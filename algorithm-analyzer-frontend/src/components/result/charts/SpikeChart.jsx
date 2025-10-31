import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors'; // --- ZMIANA: Importujemy nową paletę ---

// Kustomowy Tooltip dla wykresu skoków
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Filtrujemy tylko te, które mają wartość (nie są zerowe)
    const relevantPayload = payload.filter(pld => pld.value > 0);
    if (relevantPayload.length === 0) return null;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Iteracja : ${label}`}</p>
        {relevantPayload.map((pld, index) => (
          <p key={`item-${index}`} className="tooltip-item" style={{ color: pld.fill }}>
            {/* Formatujemy jako procent */}
            {`${pld.name} : ${(pld.value * 100).toFixed(2)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SpikeChart({ results, dataKey, name }) {
  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak danych do wyświetlenia.</div>;
  }

  const maxIterations = Math.max(...results.map(r => r.iterationResults?.length || 0));
  const chartData = [];

  for (let i = 0; i < maxIterations; i++) {
    const dataPoint = { iteration: i };
    let hasSpike = false;
    results.forEach(result => {
      const iteration = result.iterationResults?.[i];
      const value = iteration?.specificMetrics?.[dataKey];
      if (value != null && value > 0.001) { // Tylko rejestrujemy znaczące skoki
        dataPoint[result.algorithmName] = value;
        hasSpike = true;
      } else {
        dataPoint[result.algorithmName] = 0;
      }
    });
    // Dodajemy punkt danych tylko jeśli był jakikolwiek skok w tej iteracji
    if (hasSpike) {
        chartData.push(dataPoint);
    }
  }
  
  if (chartData.length === 0) {
    return <div className="chart-placeholder">Brak zanotowanych skoków poprawy.</div>;
  }

  return (
    <div className="chart-container">
      <h4>{name}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          {/* --- ZMIANA: Definicje gradientów --- */}
          <defs>
            {CHART_COLORS_PALETTE.map((color) => (
              <linearGradient key={color.id} id={color.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.start} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={color.stop} stopOpacity={0.7}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis 
            label={{ value: "Poprawa (%)", angle: -90, position: 'insideLeft' }}
            tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
            domain={[0, 'dataMax']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
          {results.map((result, index) => {
            // --- ZMIANA: Logika kolorowania gradientem ---
            const color = CHART_COLORS_PALETTE[index % CHART_COLORS_PALETTE.length];
            return (
              <Bar 
                key={result.algorithmName}
                dataKey={result.algorithmName} 
                name={result.algorithmName}
              >
                {chartData.map((entry, cellIndex) => (
                  <Cell 
                    key={`cell-${cellIndex}`} 
                    fill={entry[result.algorithmName] > 0 ? `url(#${color.id})` : 'transparent'} 
                  />
                ))}
              </Bar>
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

