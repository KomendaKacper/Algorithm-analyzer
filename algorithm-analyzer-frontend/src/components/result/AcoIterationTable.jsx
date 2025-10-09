export default function AcoIterationTable({ data }) {
  return (
    <table border="1" cellPadding="5" style={{ marginTop: "10px" }}>
      <thead>
        <tr>
          <th>Iteracja</th>
          <th>Najlepsza ścieżka</th>
          <th>Najlepszy dystans</th>
          <th>Średni dystans</th>
          <th>Najgorszy dystans</th>
          <th>Czas [ms]</th>
        </tr>
      </thead>
      <tbody>
        {data.map((ir, idx) => (
          <tr key={idx}>
            <td>{ir.iteration}</td>
            <td>{ir.bestPath?.join(" → ") || "-"}</td>
            <td>{ir.bestDistance.toFixed(2)}</td>
            <td>
              {ir.averageDistance != null
                ? Number(ir.averageDistance).toFixed(2)
                : "-"}
            </td>
            <td>
              {ir.worstDistance != null
                ? Number(ir.worstDistance).toFixed(2)
                : "-"}
            </td>

            <td>{ir.executionDurationMs.toFixed(3)} ms</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
