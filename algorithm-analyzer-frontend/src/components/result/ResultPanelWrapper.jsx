import AlgorithmResultPanel from "./AlgorithmResultPanel";
import '../../App.css'; 

export default function ResultPanelWrapper({ results, addPanel }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="result-wrapper">
      {/* Przekazujemy całą listę `results` do każdego panelu podrzędnego */}
      {results.map((result, index) => (
        <AlgorithmResultPanel 
          key={result.algorithmName || index}
          result={result} 
          allResults={results} // <-- NOWY PROP: Przekazujemy wszystkie wyniki
          addPanel={addPanel}
        />
      ))}
    </div>
  );
}