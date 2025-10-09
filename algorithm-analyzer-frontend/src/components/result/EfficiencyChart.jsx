import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function EfficiencyChart({ data }) {
  const cleaned = data
    .map((d, i) => {
      if (i === 0) return null;
      const prev = data[i - 1];
      if (!prev.bestDistance || !d.bestDistance || !d.executionDurationMs) return null;
      const improvement = prev.bestDistance - d.bestDistance;
      return {
        iteration: d.iteration,
        efficiency: improvement / d.executionDurationMs,
      };
    })
    .filter(Boolean);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h3 style={{ textAlign: "center", marginBottom: 10 }}>Efektywność (poprawa / czas)</h3>
      <ResponsiveContainer>
        <LineChart data={cleaned}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" />
          <YAxis label={{ value: "Efektywność", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="efficiency" stroke="#16A085" dot={false} name="Efektywność" strokeWidth={2.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
