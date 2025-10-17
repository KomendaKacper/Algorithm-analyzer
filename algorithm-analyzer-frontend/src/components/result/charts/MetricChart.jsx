import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6"];

// Zmieniamy props: `data` na `results`
export const MetricChart = ({ results, dataKey, name }) => {

  const combinedData = useMemo(() => {
    if (!results || results.length === 0) return [];
    
    const dataMap = new Map();
    results.forEach((result) => {
      if (!result.success || !result.iterationResults) return;
      
      result.iterationResults.forEach(iter => {
        if (!dataMap.has(iter.iteration)) {
          dataMap.set(iter.iteration, { iteration: iter.iteration });
        }
        const point = dataMap.get(iter.iteration);
        point[`${dataKey}_${result.algorithmName}`] = iter[dataKey];
      });
    });

    return Array.from(dataMap.values()).sort((a, b) => a.iteration - b.iteration);
  }, [results, dataKey]);
  
  if (combinedData.length === 0) {
    return <div style={{ textAlign: "center", color: "#999", margin: "2em 0" }}>Brak danych do wyświetlenia.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="iteration" label={{ value: "Iteracja", position: "insideBottom", dy: 10 }} />
        <YAxis label={{ value: name, angle: -90, position: "insideLeft" }} allowDecimals={false} />
        <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
        <Legend />

        {/* Dynamiczne renderowanie linii dla każdego wyniku */}
        {results.map((result, index) => (
          result.success && (
            <Line
              key={result.algorithmName}
              type="monotone"
              dataKey={`${dataKey}_${result.algorithmName}`}
              name={result.algorithmName}
              stroke={COLORS[index % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          )
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};