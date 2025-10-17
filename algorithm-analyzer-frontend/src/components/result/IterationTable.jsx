import React from 'react';
import '../../App.css'; // Upewnij się, że masz ten import, jeśli używasz stylów z App.css

export default function IterationTable({ data, problemName = "", algorithmName = "" }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>Brak danych iteracyjnych do wyświetlenia.</p>;
  }

  // Wykrywamy typ problemu do formatowania ścieżki
  const isTsp = problemName.toLowerCase().includes("salesman");
  
  // Wykrywamy typ algorytmu na podstawie unikalnego pola w danych iteracyjnych
  const isSA = data[0]?.hasOwnProperty('temperature');

  const formatPath = (path) => {
    if (!path || path.length === 0) return "-";
    
    const separator = isTsp ? " → " : ", ";
    const pathString = path.join(separator);

    if (pathString.length > 50) {
      return `${pathString.substring(0, 50)}...`;
    }
    return pathString;
  };

  const formatNumber = (value, decimals = 2) => {
    if (value == null || isNaN(value)) return "-";
    return Number(value).toFixed(decimals);
  };

  return (
    <div className="iteration-table-container">
      {algorithmName && <h4>Tabela dla: {algorithmName}</h4>}
      <table className="iteration-table">
        <thead>
          <tr>
            <th>Iteracja</th>
            {isSA && <th>Temperatura</th>}
            <th>Najlepsze rozwiązanie (skrót)</th>
            <th>Najlepszy wynik</th>
            {isSA && <th>Bieżący wynik</th>}
            {isSA && <th>Akcept. gorsze</th>}
            <th>Czas [ms]</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ir, idx) => (
            <tr key={idx}>
              <td>{ir.iteration}</td>
              {isSA && <td>{formatNumber(ir.temperature)}</td>}
              <td title={ir.bestSolution?.join(isTsp ? " → " : ", ")}>
                {formatPath(ir.bestSolution)}
              </td>
              <td>{formatNumber(ir.bestScore)}</td>
              {isSA && <td>{formatNumber(ir.currentScore)}</td>}
              {isSA && <td>{ir.acceptedWorseMoves}</td>}
              <td>{formatNumber(ir.executionDurationMs, 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}