// src/components/result/charts/ScatterPlotChart.jsx
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{payload[0].name}</p>
        <p>Czas: {data.x.toFixed(0)} ms</p>
        <p>Wynik: {data.y.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function ScatterPlotChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">Brak danych do analizy rozrzutu. Dodaj wyniki do porównania.</div>;
  }

  // Grupuj dane po nazwie algorytmu
  const groupedData = data.reduce((acc, result) => {
    const name = result.algorithmName;
    if (!acc[name]) acc[name] = [];
    acc[name].push({
      x: result.executionDurationMs,
      y: result.bestScore,
    });
    return acc;
  }, {});

  const isMaximization = data[0]?.problemName && !data[0].problemName.includes("Traveling Salesman");

  return (
    <div className="chart-container">
        <h4>Kompromis Jakość vs. Czas</h4>
        <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 30, right: 20, bottom: 25, left: 50 }}>
                <CartesianGrid />
                <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Czas wykonania" 
                    unit="ms" 
                    label={{ value: 'Czas (ms)', position: 'insideBottom', offset: -15 }}
                />
                <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Najlepszy wynik" 
                    label={{ value: 'Wynik', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    domain={['auto', 'auto']}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
                {Object.keys(groupedData).map((name, index) => {
                  const color = CHART_COLORS_PALETTE[index % CHART_COLORS_PALETTE.length];
                  return (
                    <Scatter 
                        key={name}
                        name={name} 
                        data={groupedData[name]} 
                        fill={color.line} 
                    />
                  )
                })}
            </ScatterChart>
        </ResponsiveContainer>
    </div>
  );
}