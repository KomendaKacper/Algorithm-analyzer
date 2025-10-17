import { useState, useEffect } from "react";
import { getProblems } from "../../api/problemApi";
import KnapsackConfiguration from "./KnapsackConfiguration";
import TspGenerator from "./TspGenerator"; // <-- KROK 2.1: Importujemy nowy komponent

export default function ProblemPanel({ setCurrentTask }) {
  const [problems, setProblems] = useState([]);
  const [selectedProblemName, setSelectedProblemName] = useState("");
  
  // Stan dla JSON-a w textarea, domyślnie pusty
  const [tspParamsJson, setTspParamsJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    getProblems().then((res) => setProblems(res.data)).catch(console.error);
  }, []);

  const handleSelectProblem = (displayName) => {
    setSelectedProblemName(displayName);
    setCurrentTask({ type: null, name: null, problemName: null, problemParameters: {}, algorithmParameters: {} });
  };

  // --- KROK 2.2: Funkcja, która obsłuży wygenerowany problem ---
  const handleProblemGenerated = (generatedProblem) => {
    // Aktualizujemy textarea sformatowanym JSON-em z generatora
    setTspParamsJson(JSON.stringify(generatedProblem, null, 2));
  };

  useEffect(() => {
    if (!selectedProblemName) return;

    const problemApiName = selectedProblemName;

    if (selectedProblemName === "Traveling Salesman Problem (TSP)") {
      // Jeśli textarea jest pusta, nie rób nic
      if (!tspParamsJson) {
        setJsonError("");
        return;
      }

      try {
        const parsedParams = JSON.parse(tspParamsJson);
        setJsonError("");
        setCurrentTask(prev => ({
          ...prev,
          type: "algorithm",
          problemName: problemApiName,
          problemParameters: parsedParams,
        }));
      } catch (error) {
        setJsonError("Błąd w formacie JSON!");
      }
    } 
    // ... reszta logiki dla innych problemów
  }, [selectedProblemName, tspParamsJson, setCurrentTask]);

  return (
    <div className="panel">
      <h3>Konfiguracja Problemu</h3>
      <select value={selectedProblemName} onChange={(e) => handleSelectProblem(e.target.value)}>
        <option value="">Wybierz problem...</option>
        {problems.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
      </select>

      {selectedProblemName === "Traveling Salesman Problem (TSP)" && (
        <div className="tsp-config-container">
          {/* --- KROK 2.3: Dodajemy generator do interfejsu --- */}
          <TspGenerator onGenerate={handleProblemGenerated} />
          
          <hr className="divider" />
          
          <div className="tsp-json-editor">
            <label>Lub wklej własny problem (JSON)</label>
            <textarea
              value={tspParamsJson}
              onChange={(e) => setTspParamsJson(e.target.value)}
              rows={10}
              placeholder="Tutaj pojawi się wygenerowany problem lub możesz wkleić własny..."
              className={jsonError ? "error-json" : ""}
            />
            {jsonError && <small className="error-message">{jsonError}</small>}
          </div>
        </div>
      )}

      {selectedProblemName === "Knapsack Problem" && (
        <KnapsackConfiguration setCurrentTask={setCurrentTask} />
      )}
    </div>
  );
}