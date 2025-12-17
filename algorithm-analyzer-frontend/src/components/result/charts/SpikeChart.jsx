import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors';

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
                {`${pld.name} : ${typeof pld.value === 'number' ? pld.value.toFixed(2) : pld.value}%`}
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

  // Funkcja pomocnicza do pobierania wartości (z specificMetrics lub bezpośrednio z obiektu)
  const getValue = (iteration, key) => {
    if (!iteration) return 0;
    if (iteration.specificMetrics && iteration.specificMetrics.hasOwnProperty(key)) {
        return iteration.specificMetrics[key];
    }
    if (iteration.hasOwnProperty(key)) {
        return iteration[key];
    }
    return 0;
  };
  
  const maxIterations = Math.max(...results.map(r => r.iterationResults?.length || 0));
  const chartData = [];

  for (let i = 0; i < maxIterations; i++) {
    const dataPoint = { iteration: i };
    results.forEach(result => {
      const iteration = result.iterationResults?.[i];
      const val = getValue(iteration, dataKey);
      
      if (val > 0) {
        // Mnożymy x100, aby wyświetlić w procentach
        dataPoint[result.algorithmName] = val * 100;
      }
    });
    chartData.push(dataPoint);
  }
  
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
          margin={{ top: 30, right: 30, left: 50, bottom: 25 }}
        >
          {/* --- ZMIANA: Definicje gradientów --- */}
          <defs>
            {CHART_COLORS_PALETTE.map((color, index) => (
              <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.line} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color.line} stopOpacity={0.3}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: 'Iteracja', position: 'insideBottom', offset: -15 }} />
          <YAxis 
            label={{ value: "Poprawa (%)", angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
            unit="%"
            tickFormatter={(tick) => tick.toFixed(0)} 
          />
          <Tooltip
            content={<CustomTooltip />} // Używamy kustomowego tooltipa
            labelFormatter={(label) => `Iteracja: ${label}`}
          />
          <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
          {results.map((result, index) => {
            const color = CHART_COLORS_PALETTE[index % CHART_COLORS_PALETTE.length];
            const gradientId = `grad-${index % CHART_COLORS_PALETTE.length}`;
            
            return (
              <Bar
                key={result.algorithmName}
                dataKey={result.algorithmName}
                name={result.algorithmName}
                fill={`url(#${gradientId})`}
                stroke={color.line}
              />
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

