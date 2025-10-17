import React from "react";
import '../../App.css'; 

export default function AlgorithmResultPanel({ result, allResults, addPanel }) {
  if (!result) return null;
  
  const isTsp = result.problemName?.toLowerCase().includes("salesman");
  
  const labels = {
    score: isTsp ? "Najlepszy wynik (dystans)" : "Najlepszy wynik (wartość)",
    unit: isTsp ? "km" : "",
    solution: isTsp ? "Najlepsza znaleziona trasa" : "Przedmioty w plecaku",
  };

  const formatSolution = (solution) => {
    if (!solution || solution.length === 0) return "Brak danych";
    if (isTsp) return `${solution.join(" → ")} → ${solution[0]}`;
    return solution.join(", ");
  };

  // --- KLUCZOWA ZMIANA: Przyciski dla wykresów przekazują WSZYSTKIE wyniki ---
  // A przycisk dla tabeli przekazuje tylko JEDEN wynik.
  return (
    <div className="result-panel result-panel-top">
      <h3>Wynik: {result.algorithmName}</h3>
      {result.success ? (
        <div className="result-content">
          <div className="result-metric">
            <strong>🏆 {labels.score}:</strong>
            <span>{result.bestScore != null ? `${parseFloat(result.bestScore).toFixed(2)} ${labels.unit}`.trim() : "Brak danych"}</span>
          </div>
          <div className="result-metric">
            <strong>⏱️ Łączny czas wykonania:</strong>
            <span>{result.executionDurationMs != null ? `${(result.executionDurationMs / 1000).toFixed(3)} s` : "Brak danych"}</span>
          </div>
          <div className="result-metric full-width">
            <strong>{isTsp ? '📍' : '🎒'} {labels.solution}: </strong>
            <span className="solution-path">{formatSolution(result.bestSolution)}</span>
          </div>

          <div className="result-buttons">
            <button className="result-button" onClick={() => addPanel("table", result)}>📊 Pokaż tabelę</button>
            <button className="result-button" onClick={() => addPanel("charts-score", allResults)}>📈 Porównaj wyniki</button>
            <button className="result-button" onClick={() => addPanel("charts-time", allResults)}>🕒 Porównaj czas</button>
            <button className="result-button" onClick={() => addPanel("charts-diversity", allResults)}>🧬 Porównaj różnorodność</button>
            <button className="result-button" onClick={() => addPanel("charts-stagnation", allResults)}>⏳ Porównaj stagnację</button>
          </div>
        </div>
      ) : (
        <div className="error">
          <p><strong>Wystąpił błąd:</strong> {result.errorMessage || "Nieznany błąd"}</p>
        </div>
      )}
    </div>
  );
}