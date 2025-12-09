import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ErrorBar, Label } from 'recharts';
import { CHART_COLORS_PALETTE } from './chartColors';

// Helper functions to calculate statistics
const calculateMean = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};
const calculateStdDev = (arr) => {
  if (!arr || arr.length < 2) return 0; // Odchylenie standardowe dla 0 lub 1 elementu to 0
  const mean = calculateMean(arr);
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
};

// Kustomowy Tooltip dla wykresu stabilności
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip">
            <p className="tooltip-label">{label}</p>
            <p>Średni wynik: {data.mean.toFixed(2)}</p>
            <p>Odch. std.: &plusmn;{(data.mean - data.errorRange[0]).toFixed(2)}</p>
            <p>Liczba przebiegów: {data.runCount}</p>
            </div>
        );
    }
    return null;
};

export function StabilityChart({ results }) {
  if (!results || results.length === 0) {
    return <div className="chart-placeholder">Brak danych do analizy stabilności.</div>;
  }

  const groupedResults = results.reduce((acc, result) => {
    const name = result.algorithmName;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(result.bestScore);
    return acc;
  }, {});

  const chartData = Object.entries(groupedResults).map(([name, scores]) => {
    const mean = calculateMean(scores);
    const stdDev = calculateStdDev(scores);
    return { 
      name, 
      mean, 
      errorRange: [mean - stdDev, mean + stdDev],
      runCount: scores.length 
    };
  });

  const isMaximization = results[0]?.problemName !== "Traveling Salesman Problem (TSP)";

  return (
    <div className="chart-container">
      <h4>Stabilność wyników (Średnia i Odchylenie Standardowe)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
            data={chartData} 
            margin={{ top: 30, right: 30, left: 50, bottom: 25 }}
        >
          {/* --- ZMIANA: Dodajemy definicje gradientów --- */}
          <defs>
            {CHART_COLORS_PALETTE.map((color, index) => (
              <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.line} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={color.line} stopOpacity={0.6}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" label={{ value: 'Algorytm', position: 'insideBottom', offset: -15 }} />
          <YAxis 
            label={{ value: 'Średni Wynik', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            domain={['auto', 'auto']}
            padding={{ top: 20, bottom: 20 }}
            tickFormatter={(tick) => tick.toFixed(0)}
          />
          <Tooltip
            cursor={{fill: 'rgba(206, 212, 218, 0.3)'}}
            content={<CustomTooltip />}
          />
          <Bar dataKey="mean" name="Średni Wynik">
             {chartData.map((entry, index) => {
                const gradientId = `grad-${index % CHART_COLORS_PALETTE.length}`;
                return <Cell key={`cell-${index}`} fill={`url(#${gradientId})`} />
             })}
             {/* --- POPRAWKA: Kolor wąsów w trybie ciemnym --- */}
             <ErrorBar dataKey="errorRange" width={4} strokeWidth={2} stroke="var(--color-text-secondary)" direction="y" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

