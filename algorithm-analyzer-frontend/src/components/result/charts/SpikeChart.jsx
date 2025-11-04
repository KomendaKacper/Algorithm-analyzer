import React from 'react';
// --- POPRAWKA: Dodajemy import 'Cell' ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors';

// --- NOWY KUSTOMOWY TOOLTIP (lepiej obsługuje nazwy) ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const relevantPayload = payload.filter(pld => pld.value > 0);
    if (relevantPayload.length === 0) return null;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Iteracja : ${label}`}</p>
        {relevantPayload.map((pld, index) => {
            // Używamy koloru `fill` przekazanego przez <Cell>
            const color = pld.fill; 
            return (
              <p key={`item-${index}`} className="tooltip-item" style={{ color: color }}>
                {`${pld.name} : ${pld.value.toFixed(2)}%`}
              </p>
            )
        })}
      </div>
    );
  }
  return null;
};


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

  // --- Logika budowania danych (Twoja wersja) ---
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
  
  // --- Logika filtrowania (Twoja wersja) ---
  const filteredData = chartData.filter(d => Object.keys(d).length > 1);

  if (filteredData.length === 0) {
    return <div className="chart-placeholder">Brak zanotowanych skoków poprawy.</div>;
  }

  return (
    <div className="chart-container">
      <h4>{name} w momentach poprawy wyniku</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={filteredData} // Używamy przefiltrowanych danych
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
            unit="%"
            tickFormatter={(tick) => tick.toFixed(0)} 
          />
          <Tooltip
            content={<CustomTooltip />} // Używamy kustomowego tooltipa
            labelFormatter={(label) => `Iteracja: ${label}`}
          />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
          {results.map((result, index) => {
            // --- ZMIANA: Logika kolorowania gradientem przy użyciu Cell ---
            const color = CHART_COLORS_PALETTE[index % CHART_COLORS_PALETTE.length];
            return (
              <Bar
                key={result.algorithmName}
                dataKey={result.algorithmName}
                name={result.algorithmName}
              >
                {filteredData.map((entry, cellIndex) => (
                  <Cell 
                    key={`cell-${cellIndex}`} 
                    // Używamy `color.line` dla tooltipa, a `url` dla gradientu
                    fill={entry[result.algorithmName] ? `url(#${color.id})` : 'transparent'} 
                    color={color.line}
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

