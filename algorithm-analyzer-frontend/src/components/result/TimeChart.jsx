import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function TimeChart({ data }) {

  const round = (value, digits = 2) => Number(value.toFixed(digits));
  const formatNumber = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000) return `${round(value / 1_000_000)}M`;
    if (absValue >= 1_000) return `${round(value / 1_000)}k`;
    if (absValue > 0 && absValue < 0.01) return value.toExponential(2);
    return round(value);
  };

  const addPadding = (min, max, factor = 0.25) => {
    const range = max - min || 1;
    return [min - range * factor, max + range * factor];
  };

  const shouldUseLog = (values) => {
    const filtered = values.filter(v => v > 0);
    if (!filtered.length) return false;
    return Math.max(...filtered) / Math.min(...filtered) > 1000;
  };

  const times = data.map(d => d.executionDurationMs).filter(v => v !== null && isFinite(v));

  const [minTime, maxTime] = times.length
    ? addPadding(Math.min(...times), Math.max(...times))
    : [0, 500];

  const timeLog = shouldUseLog(times);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="iteration" label={{ value: "Iteracja", position: "insideBottom", dy: 10 }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[minTime, maxTime]}
          scale={timeLog ? "log" : "linear"}
          tickFormatter={formatNumber}
          label={{ value: "Czas [ms]", angle: 90, position: "insideRight" }}
        />
        <Tooltip formatter={(value) => formatNumber(value)} />
        <Legend />
        <Line yAxisId="right" type="monotone" dataKey="executionDurationMs" stroke="#9C27B0" name="Czas [ms]" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
