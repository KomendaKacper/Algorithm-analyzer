import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function ImprovementRateChart({ data }) {
  const cleaned = data
    .map((d, i) => {
      if (i === 0) return null;
      const prev = data[i - 1];
      if (!prev.bestDistance || !d.bestDistance) return null;
      return {
        iteration: d.iteration,
        improvement: prev.bestDistance - d.bestDistance,
      };
    })
    .filter(Boolean);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h3 style={{ textAlign: "center", marginBottom: 10 }}>Tempo poprawy najlepszego wyniku</h3>
      <ResponsiveContainer>
        <LineChart data={cleaned}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="iteration" />
          <YAxis label={{ value: "Poprawa", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="improvement" stroke="#9B59B6" dot={false} name="Poprawa" strokeWidth={2.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
