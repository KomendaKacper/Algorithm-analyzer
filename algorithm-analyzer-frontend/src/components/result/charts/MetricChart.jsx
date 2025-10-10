import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cleanIterationData } from "../../../functions/cleanIterationData";
import { computeMetrics } from "../../../functions/computeMetrics";

const linearRegression = (points) => {
  const n = points.length;
  if (n < 2) return [];
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return points.map((p) => ({ ...p, trend: p.y }));
  const a = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - a * sumX) / n;
  return points.map((p) => ({ ...p, trend: a * p.x + b }));
};

const formatNumber = (value) => {
  if (value == null || isNaN(value)) return "—";
  const abs = Math.abs(value);
  const round = (v, digits = 2) => Number(v.toFixed(digits));
  if (abs >= 1_000_000) return `${round(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${round(value / 1_000)}k`;
  if (abs > 0 && abs < 0.001) return value.toExponential(2);
  return round(value);
};

export const MetricChart = ({
  data,
  dataKey,
  name,
  color = "#3498DB",
  algorithmName = "Algorytm",
}) => {
  const [showTrend, setShowTrend] = useState(true);

  const processed = useMemo(() => {
    const metrics = computeMetrics(data);
    const cleaned = cleanIterationData(metrics);
    const filtered = cleaned.filter((d) => d[dataKey] != null);

    const trendPoints = linearRegression(
      filtered.map((d) => ({ x: d.iteration, y: d[dataKey] }))
    );

    return cleaned.map((d) => ({
      ...d,
      trend: trendPoints.find((tp) => tp.x === d.iteration)?.trend ?? null,
    }));
  }, [data, dataKey]);

  const values = processed
    .map((d) => d[dataKey])
    .filter((v) => v != null && isFinite(v));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.25 || 1;

  if (!values.length) {
    return (
      <div style={{ textAlign: "center", color: "#999", margin: "2em 0" }}>
        Brak danych do wyświetlenia ({name})
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* 🔘 Przycisk toggle trendu */}
      <div style={{ textAlign: "right", marginBottom: 10 }}>
        <button
          onClick={() => setShowTrend((prev) => !prev)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: showTrend ? color : "#ccc",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {showTrend ? "Ukryj trend" : "Pokaż trend"}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={processed}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="iteration"
            label={{ value: "Iteracja", position: "insideBottom", dy: 10 }}
          />
          <YAxis
            domain={[min - padding, max + padding]}
            tickFormatter={formatNumber}
            label={{ value: name, angle: -90, position: "insideLeft" }}
          />
          <Tooltip formatter={formatNumber} />
          <Legend formatter={(val) => `${algorithmName} - ${val}`} />

          {/* Linia główna */}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            name={name}
            dot={false}
            strokeWidth={2.5}
          />

          {/* Linia trendu z outline (kolor algorytmu + biały środek, przerywana) */}
          {showTrend && (
            <>
              {/* Gruba linia w kolorze algorytmu */}
              <Line
                type="linear"
                dataKey="trend"
                stroke={color}
                strokeWidth={6} // grubiej, żeby wyróżnić
                dot={false}
                name={`${name} (trend)`}
              />
              {/* Cieńsza, biała przerywana linia na wierzchu */}
              <Line
                type="linear"
                dataKey="trend"
                stroke="#fff"
                strokeWidth={3}
                dot={false}
                strokeDasharray="8 4" // bardziej widoczna przerywana
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
