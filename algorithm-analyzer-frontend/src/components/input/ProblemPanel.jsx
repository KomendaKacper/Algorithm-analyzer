import { useState, useEffect } from "react";
import InputField from "../../uiComponents/InputField"; // Upewnij się, że ścieżka jest poprawna

// --- Twój stary sub-komponent TspConfig (Przywrócony) ---
const TspConfig = ({ onConfigChange }) => {
  const [inputMode, setInputMode] = useState('json'); // 'json' lub 'generate'
  const [cities, setCities] = useState('["1", "2", "3", "4", "5"]');
  const [distances, setDistances] = useState(
`{
  "1": {"2": 10, "3": 15, "4": 20, "5": 25},
  "2": {"1": 10, "3": 35, "4": 25, "5": 30},
  "3": {"1": 15, "2": 35, "4": 30, "5": 10},
  "4": {"1": 20, "2": 25, "3": 30, "5": 20},
  "5": {"1": 25, "2": 30, "3": 10, "4": 20}
}`
  );
  const [error, setError] = useState("");

  // Stany dla generatora
  const [cityCount, setCityCount] = useState(10);
  const [maxDist, setMaxDist] = useState(500);

  const generateRandomTspData = () => {
    try {
      const newCities = [];
      for (let i = 1; i <= cityCount; i++) {
        newCities.push(`${i}`);
      }

      const tempMatrix = Array(cityCount).fill(null).map(() => Array(cityCount).fill(0));
      for (let i = 0; i < cityCount; i++) {
        for (let j = i + 1; j < cityCount; j++) {
          const dist = Math.floor(Math.random() * maxDist) + 1;
          tempMatrix[i][j] = dist;
          tempMatrix[j][i] = dist; // Zapewnienie symetrii
        }
      }
      
      const newDistances = {};
      newCities.forEach((city, i) => {
        newDistances[city] = {};
        newCities.forEach((otherCity, j) => {
          if (i !== j) {
            newDistances[city][otherCity] = tempMatrix[i][j];
          }
        });
      });

      setCities(JSON.stringify(newCities, null, 2));
      setDistances(JSON.stringify(newDistances, null, 2));
      setError("");
      setInputMode('json');
    } catch (e) {
      setError("Błąd podczas generowania danych: " + e.message);
    }
  };

  useEffect(() => {
    try {
      const parsedCities = JSON.parse(cities);
      const parsedDistances = JSON.parse(distances);
      setError("");
      onConfigChange({
        name: "Traveling Salesman Problem (TSP)",
        parameters: { cities: parsedCities, distances: parsedDistances }
      });
    } catch (e) {
      setError("Błąd parsowania JSON: " + e.message);
    }
  }, [cities, distances, onConfigChange]);

  return (
    <div className="tsp-config-container">
      <div className="tab-buttons">
        <button className={`tab-button ${inputMode === 'json' ? 'active' : ''}`} onClick={() => setInputMode('json')}>Wprowadź JSON</button>
        <button className={`tab-button ${inputMode === 'generate' ? 'active' : ''}`} onClick={() => setInputMode('generate')}>Generator</button>
      </div>

      {inputMode === 'json' ? (
        <>
          <div className="form-group">
            <label>Miasta (jako tablica JSON)</label>
            <textarea 
              className={`input json-input ${error ? 'error-json' : ''}`}
              rows="3"
              value={cities}
              onChange={e => setCities(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Macierz Odległości (jako obiekt JSON)</label>
            <textarea 
              className={`input json-input ${error ? 'error-json' : ''}`}
              rows="10"
              value={distances}
              onChange={e => setDistances(e.target.value)}
            />
          </div>
        </>
      ) : (
        <div className="tsp-generator">
          <div className="form-group">
            <label>Liczba miast do wygenerowania</label>
            <input type="number" className="input" value={cityCount} onChange={e => setCityCount(parseInt(e.target.value) || 1)} min="2" />
          </div>
          <div className="form-group">
            <label>Maksymalna odległość</label>
            <input type="number" className="input" value={maxDist} onChange={e => setMaxDist(parseInt(e.target.value) || 1)} min="10" />
          </div>
          <button className="panel-button secondary" onClick={generateRandomTspData}>Generuj Dane</button>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

// --- Twój stary sub-komponent KnapsackConfig (Przywrócony) ---
const KnapsackConfig = ({ onConfigChange }) => {
  const [inputMode, setInputMode] = useState('json'); // 'json' lub 'generate'
  const [capacity, setCapacity] = useState(50);
  const [items, setItems] = useState('["A", "B", "C", "D"]');
  const [weights, setWeights] = useState('{"A": 10, "B": 20, "C": 30, "D": 15}');
  const [values, setValues] = useState('{"A": 60, "B": 100, "C": 120, "D": 70}');
  const [error, setError] = useState("");

  // Generator danych losowych
  const [itemCount, setItemCount] = useState(20);
  const [maxWeight, setMaxWeight] = useState(50);
  const [maxValue, setMaxValue] = useState(200);

  const generateRandomKnapsackData = () => {
    const newItems = [];
    const newWeights = {};
    const newValues = {};
    let totalWeight = 0;

    for (let i = 1; i <= itemCount; i++) {
      const itemName = `Przedmiot ${i}`;
      const weight = Math.floor(Math.random() * maxWeight) + 1;
      const value = Math.floor(Math.random() * maxValue) + 1;
      
      newItems.push(itemName);
      newWeights[itemName] = weight;
      newValues[itemName] = value;
      totalWeight += weight;
    }

    setItems(JSON.stringify(newItems, null, 2));
    setWeights(JSON.stringify(newWeights, null, 2));
    setValues(JSON.stringify(newValues, null, 2));
    setCapacity(Math.floor(totalWeight / 2));
    setInputMode('json');
  };
  

  useEffect(() => {
    try {
      const parsedItems = JSON.parse(items);
      const parsedWeights = JSON.parse(weights);
      const parsedValues = JSON.parse(values);
      
      if (isNaN(capacity) || capacity <= 0) {
        throw new Error("Pojemność musi być liczbą dodatnią.");
      }

      setError("");
      onConfigChange({
        name: "Knapsack Problem",
        parameters: { 
          items: parsedItems, 
          weights: parsedWeights, 
          values: parsedValues, 
          capacity: Number(capacity)
        }
      });
    } catch (e) {
      setError("Błąd w danych wejściowych: " + e.message);
    }
  }, [capacity, items, weights, values, onConfigChange]);

  return (
    <div className="knapsack-config-container">
      <div className="tab-buttons">
        <button className={`tab-button ${inputMode === 'json' ? 'active' : ''}`} onClick={() => setInputMode('json')}>Wprowadź JSON</button>
        <button className={`tab-button ${inputMode === 'generate' ? 'active' : ''}`} onClick={() => setInputMode('generate')}>Generator</button>
      </div>

      {inputMode === 'json' ? (
        <>
          <div className="form-group">
            <label>Pojemność plecaka</label>
            <input type="number" className="input" value={capacity} onChange={e => setCapacity(e.target.value)} />
          </div>
            <div className="form-group">
            <label>Przedmioty (jako tablica JSON)</label>
            <textarea className="input json-input" rows="2" value={items} onChange={e => setItems(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Wagi (jako obiekt JSON)</label>
            <textarea className="input json-input" rows="3" value={weights} onChange={e => setWeights(e.target.value)} />
          </div>
            <div className="form-group">
            <label>Wartości (jako obiekt JSON)</label>
            <textarea className="input json-input" rows="3" value={values} onChange={e => setValues(e.target.value)} />
          </div>
        </>
      ) : (
        <div className="knapsack-generator">
          <div className="form-group">
            <label>Liczba przedmiotów do wygenerowania</label>
            <input type="number" className="input" value={itemCount} onChange={e => setItemCount(parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Maksymalna waga przedmiotu</label>
            <input type="number" className="input" value={maxWeight} onChange={e => setMaxWeight(parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Maksymalna wartość przedmiotu</label>
            <input type="number" className="input" value={maxValue} onChange={e => setMaxValue(parseInt(e.target.value))} />
          </div>
          <button className="panel-button secondary" onClick={generateRandomKnapsackData}>Generuj Dane</button>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

// --- Pomocnik do parsowania wartości na podstawie typu ---
const parseValue = (value, type) => {
  switch (type) {
    case "INTEGER":
      return parseInt(value, 10) || 0;
    case "DOUBLE":
      return parseFloat(value) || 0.0;
    case "BOOLEAN":
      return Boolean(value);
    default:
      return value;
  }
};

// --- NOWY, GŁÓWNY KOMPONENT HYBRYDOWY ---
export default function ProblemPanel({ problems = [], setProblemConfig }) {
  const [selectedProblemName, setSelectedProblemName] = useState("");
  const [dynamicParams, setDynamicParams] = useState({});

  // Znajdź pełny obiekt wybranego problemu
  const selectedProblem = problems.find(p => p.name === selectedProblemName) || null;

  // Funkcja wywoływana przy zmianie problemu w <select>
  const handleProblemChange = (e) => {
    const newName = e.target.value;
    setSelectedProblemName(newName);

    if (!newName) {
      setProblemConfig({ name: null, parameters: {} });
      setDynamicParams({});
      return;
    }

    const problem = problems.find(p => p.name === newName);
    
    // Specjalna obsługa dla problemów z własnym UI
    if (newName === "Traveling Salesman Problem (TSP)" || newName === "Knapsack Problem") {
      // Te komponenty same wywołają setProblemConfig, więc tutaj nic nie robimy
      // Ale czyścimy dynamiczne parametry
      setDynamicParams({});
    } 
    // Obsługa problemów dynamicznych
    else if (problem && problem.parameters) {
      const initialParams = {};
      problem.parameters.forEach(p => {
        initialParams[p.name] = parseValue(p.defaultValue, p.type);
      });
      
      setDynamicParams(initialParams);
      setProblemConfig({ name: newName, parameters: initialParams });
    } else {
      // Problem bez parametrów
      setDynamicParams({});
      setProblemConfig({ name: newName, parameters: {} });
    }
  };

  // Funkcja wywoływana przy zmianie wartości DYNAMICZNEGO parametru
  const handleDynamicParamChange = (name, value, type) => {
    const parsedValue = parseValue(value, type);
    
    const newParams = { ...dynamicParams, [name]: parsedValue };
    setDynamicParams(newParams);
    
    setProblemConfig(prev => ({ ...prev, name: selectedProblemName, parameters: newParams }));
  };

  // --- Renderowanie dynamicznego formularza dla problemów niestandardowych ---
  const renderDynamicForm = () => {
    if (!selectedProblem || !selectedProblem.parameters || selectedProblem.parameters.length === 0) {
      return <p className="info-text">Ten problem nie wymaga dodatkowej konfiguracji.</p>;
    }

    return (
      <div className="dynamic-params-container" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {selectedProblem.parameters.map((param) => (
          <InputField
            key={param.name}
            label={param.displayName || param.name}
            description={param.description}
            type={param.type === "DOUBLE" || param.type === "INTEGER" ? "number" : "text"}
            value={dynamicParams[param.name] ?? ''}
            step={param.type === "DOUBLE" ? 0.1 : 1}
            min={param.minValue}
            max={param.maxValue}
            isCheckbox={param.type === "BOOLEAN"}
            onChange={(value) => handleDynamicParamChange(param.name, value, param.type)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="problem-panel">
      <div className="form-group">
        <label>Wybierz problem do analizy</label>
        {/* Dropdown jest teraz dynamicznie ładowany z API */}
        <select value={selectedProblemName} onChange={handleProblemChange} className="select">
          <option value="">-- Wybierz problem --</option>
          {problems.map((problem) => (
            <option key={problem.name} value={problem.name}>
              {problem.name}
            </option>
          ))}
        </select>
        {selectedProblem && (
          <p className="info-text" style={{padding: '8px 0 0 0', textAlign: 'left'}}>
            <small>{selectedProblem.description}</small>
          </p>
        )}
      </div>

      <hr className="divider" />

      {/* --- Logika renderowania hybrydowego --- */}
      
      {/* 1. Renderuj stary komponent, jeśli nazwa pasuje */}
      {selectedProblemName === "Traveling Salesman Problem (TSP)" && (
        <TspConfig onConfigChange={setProblemConfig} />
      )}
      
      {/* 2. Renderuj stary komponent, jeśli nazwa pasuje */}
      {selectedProblemName === "Knapsack Problem" && (
        <KnapsackConfig onConfigChange={setProblemConfig} />
      )}

      {/* 3. Renderuj dynamiczny formularz dla WSZYSTKICH INNYCH problemów */}
      {selectedProblemName &&
        selectedProblemName !== "Traveling Salesman Problem (TSP)" &&
        selectedProblemName !== "Knapsack Problem" && (
        renderDynamicForm()
      )}
    </div>
  );
}