// src/components/result/AcoIterationTable.jsx

export default function AcoIterationTable({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>Brak danych iteracyjnych do wyświetlenia.</p>;
  }

  // Funkcja do formatowania długiej ścieżki w komórce tabeli
  const formatPath = (path) => {
    if (!path || path.length === 0) return "-";
    const pathString = path.join(" → ");
    if (pathString.length > 50) {
      return `${pathString.substring(0, 50)}...`;
    }
    return pathString;
  };

  return (
    <table className="iteration-table">
      <thead>
        <tr>
          <th>Iteracja</th>
          <th>Najlepsze rozwiązanie (skrócone)</th>
          <th>Najlepszy wynik</th>
          <th>Średni wynik</th>
          <th>Najgorszy wynik</th>
          <th>Czas [ms]</th>
        </tr>
      </thead>
      <tbody>
        {data.map((ir, idx) => (
          <tr key={idx}>
            <td>{ir.iteration}</td>
            {/* POPRAWKA: ir.bestPath -> ir.bestSolution */}
            <td title={ir.bestSolution?.join(" → ")}>{formatPath(ir.bestSolution)}</td>
            {/* POPRAWKA: ir.bestDistance -> ir.bestScore */}
            <td>{ir.bestScore != null ? ir.bestScore.toFixed(2) : "-"}</td>
            {/* POPRAWKA: ir.averageDistance -> ir.averageScore */}
            <td>{ir.averageScore != null && !isNaN(ir.averageScore) ? Number(ir.averageScore).toFixed(2) : "-"}</td>
            {/* POPRAWKA: ir.worstDistance -> ir.worstScore */}
            <td>{ir.worstScore != null ? Number(ir.worstScore).toFixed(2) : "-"}</td>
            <td>{ir.executionDurationMs.toFixed(3)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}