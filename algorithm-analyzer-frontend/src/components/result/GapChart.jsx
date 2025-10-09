import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function GapChart({ data }) {
  const cleaned = data
    .map(d => ({
      ...d,
      gap: d.averageDistance != null && d.bestDistance != null
        ? d.averageDistance - d.bestDistance
        : null,
    }))
    .filter(d => d.gap != null);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h3 style={{ textAlign: "center", marginBottom: 10 }}>Różnica (średni - najlepszy dystans)</h3>
      <ResponsiveContainer>
        <LineChart data={cleaned}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" />
          <YAxis label={{ value: "Różnica", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="gap" stroke="#E67E22" dot={false} name="Gap" strokeWidth={2.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
