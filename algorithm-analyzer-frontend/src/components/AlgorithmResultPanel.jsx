export default function AlgorithmResultPanel({ result }) {
  if (!result) return null;

  return (
    <div className="result-panel-top">
      <h3>Wyniki algorytmu</h3>
      {result.success ? (
        <div>
          <p>
            <strong>Ścieżka:</strong> {result.path?.join(" → ")}
          </p>
          <p>
            <strong>Długość:</strong> {result.pathLength?.toFixed(2)}
          </p>
          <p>
            <strong>Czas:</strong> {result.executionDurationMs}ms
          </p>

          {result?.iterationResults?.length > 0 && (
            <>
              <h4>Postęp w iteracjach</h4>
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    <th>Iteracja</th>
                    <th>Najlepsza ścieżka</th>
                    <th>Długość</th>
                    <th>Czas trwania iteracji</th>
                  </tr>
                </thead>
                <tbody>
                  {result.iterationResults.map((ir, idx) => (
                    <tr key={idx}>
                      <td>{ir.iteration}</td>
                      <td>{ir.bestPath?.join(" → ") || "-"}</td>
                      <td>{ir.bestDistance.toFixed(2)}</td>
                      <td>{ir.executionDurationMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      ) : (
        <p className="error">Błąd: {result.errorMessage}</p>
      )}
    </div>
  );
}


