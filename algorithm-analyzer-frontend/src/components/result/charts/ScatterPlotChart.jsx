import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors'; // --- ZMIANA: Importujemy nową paletę ---

// Kustomowy Tooltip dla wykresu rozrzutu
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{payload[0].name}</p> {/* Nazwa algorytmu */}
        <p>Czas wykonania: {data.x.toFixed(0)} ms</p>
        <p>Najlepszy wynik: {data.y.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};


export function ScatterPlotChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">Brak danych do analizy rozrzutu. Dodaj wyniki używając przycisku w panelu konfiguracyjnym.</div>;
  }

  // Grupuj dane po nazwie algorytmu
  const groupedData = data.reduce((acc, result) => {
    const name = result.algorithmName;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push({
      x: result.executionDurationMs,
      y: result.bestScore,
    });
    return acc;
  }, {});

  const isMaximization = data[0]?.problemName !== "Traveling Salesman Problem (TSP)";

  return (
    <div className="chart-container">
        <h4>Kompromis Jakość vs. Czas</h4>
        <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 25, left: 20 }}>
                <CartesianGrid />
                <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Czas wykonania" 
                    unit="ms" 
                    label={{ value: 'Czas wykonania (ms)', position: 'insideBottom', offset: -15 }}
                    tickFormatter={(tick) => `${tick}ms`}
                />
                <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Najlepszy wynik" 
                    label={{ value: 'Najlepszy Wynik', angle: -90, position: 'insideLeft' }}
                    domain={['auto', 'auto']}
                    padding={{ top: 20, bottom: 20 }}
                    reversed={!isMaximization}
                    tickFormatter={(tick) => tick.toFixed(0)}
                />
                <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    content={<CustomTooltip />}
                />
                <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
                {Object.keys(groupedData).map((name, index) => {
                  // --- ZMIANA: Używamy płaskich kolorów z naszej palety ---
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

