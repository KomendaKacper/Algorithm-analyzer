import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Funkcja regresji liniowej: y = a*x + b
const linearRegression = (points) => {
  const n = points.length;
  if (n === 0) return [];
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return points.map(p => ({ x: p.x, y: p.y }));

  const a = (n * sumXY - sumX * sumY) / denominator;
  const b = (sumY - a * sumX) / n;

  return points.map(p => ({ ...p, trend: a * p.x + b }));
};

// Formatowanie wartości
const formatNumber = (value) => {
  const absValue = Math.abs(value);
  const round = (v, digits = 2) => Number(v.toFixed(digits));
  if (absValue >= 1_000_000) return `${round(value / 1_000_000)}M`;
  if (absValue >= 1_000) return `${round(value / 1_000)}k`;
  if (absValue > 0 && absValue < 0.01) return value.toExponential(2);
  return round(value);
};

export const SingleDistanceChart = ({ data, dataKey, color, trendColor, name, showTrend = true }) => {
  const dataWithTrend = useMemo(() => {
    const trendPoints = linearRegression(
      data.map(d => ({ x: d.iteration, y: d[dataKey] })).filter(p => p.y !== null)
    );
    return data.map(d => ({
      ...d,
      trend: trendPoints.find(tp => tp.x === d.iteration)?.trend ?? null,
    }));
  }, [data, dataKey]);

  const values = data.map(d => d[dataKey]).filter(v => v !== null && isFinite(v));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.25 || 1;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height={600}>
        <LineChart data={dataWithTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" label={{ value: "Iteracja", position: "insideBottom", dy: 10 }} />
          <YAxis domain={[min - padding, max + padding]} tickFormatter={formatNumber} label={{ value: name, angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={formatNumber} />
          <Legend />

          <Line type="monotone" dataKey={dataKey} stroke={color} name={name} dot={false} />
          {showTrend && (
            <Line
              type="linear"
              dataKey="trend"
              stroke={trendColor}
              name={`${name} Trend`}
              dot={false}
              strokeDasharray="5 5"
              strokeWidth={3} // pogrubiona linia trendu
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
