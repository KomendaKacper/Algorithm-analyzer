import { useState, useEffect, useCallback } from "react";
import { getProblems } from "../../api/problemApi";
import KnapsackConfiguration from "./KnapsackConfiguration";
import TspGenerator from "./TspGenerator";

// Sygnatura zmieniona z setCurrentTask na setProblemConfig
export default function ProblemPanel({ setProblemConfig }) {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProblemName, setSelectedProblemName] = useState("");
  const [tspParamsJson, setTspParamsJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    getProblems().then(res => setProblems(res.data)).catch(err => setError("Nie udało się załadować listy problemów.")).finally(() => setIsLoading(false));
  }, []);

  const handleSelectProblem = (displayName) => {
    setSelectedProblemName(displayName);
    // Resetujemy tylko konfigurację problemu
    setProblemConfig({ name: displayName, parameters: {} });
  };

  const handleProblemGenerated = (generatedProblem) => {
    setTspParamsJson(JSON.stringify(generatedProblem, null, 2));
  };
  
  const handleKnapsackInstanceSelected = useCallback((instance) => {
    if (!instance) return;
    const problemParameters = { items: instance.items, weights: instance.weights, values: instance.values, capacity: instance.capacity };
    // Zmienione z setCurrentTask na setProblemConfig
    setProblemConfig({ name: "Knapsack Problem", parameters: problemParameters });
  }, [setProblemConfig]);

  useEffect(() => {
    if (selectedProblemName === "Traveling Salesman Problem (TSP)") {
      if (!tspParamsJson) return;
      try {
        const parsedParams = JSON.parse(tspParamsJson);
        setJsonError("");
        // Zmienione z setCurrentTask na setProblemConfig
        setProblemConfig({ name: selectedProblemName, parameters: parsedParams });
      } catch (error) {
        setJsonError("Błąd w formacie JSON!");
      }
    }
  }, [selectedProblemName, tspParamsJson, setProblemConfig]);

  return (
    <div className="panel">
      <h3>Konfiguracja Problemu</h3>
      {isLoading ? <p>Ładowanie...</p> : error ? <p className="error-message">{error}</p> : (
        <select value={selectedProblemName} onChange={(e) => handleSelectProblem(e.target.value)}>
          <option value="">Wybierz problem...</option>
          {problems.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
        </select>
      )}
      {selectedProblemName === "Traveling Salesman Problem (TSP)" && (
        <div className="tsp-config-container">
          <TspGenerator onGenerate={handleProblemGenerated} />
          <hr className="divider" />
          <div className="tsp-json-editor">
            <label>Lub wklej własny problem (JSON)</label>
            <textarea value={tspParamsJson} onChange={(e) => setTspParamsJson(e.target.value)} rows={10} placeholder="..." className={jsonError ? "error-json" : ""}/>
            {jsonError && <small className="error-message">{jsonError}</small>}
          </div>
        </div>
      )}
      {selectedProblemName === "Knapsack Problem" && <KnapsackConfiguration onInstanceSelected={handleKnapsackInstanceSelected} />}
    </div>
  );
}