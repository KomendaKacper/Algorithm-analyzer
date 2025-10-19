import { useState, useEffect } from "react";
import InputField from "../../uiComponents/InputField";

export default function AlgorithmPanel({ panelId, algorithms, tasks, setTasks, problemName, onRemove, canBeRemoved }) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  
  const currentTask = tasks[panelId] || {};

  useEffect(() => {
    const taskName = tasks[panelId]?.name;
    if (taskName) {
      const algo = algorithms.find(a => a.name === taskName);
      setSelectedAlgorithm(algo || null);
    } else {
      setSelectedAlgorithm(null);
    }
  }, [tasks, panelId, algorithms]);

  const handleAlgorithmSelect = (algoName) => {
    const algo = algorithms.find((a) => a.name === algoName) || null;
    
    const initialAlgoParams = {};
    if (algo) {
      algo.parameters.forEach(p => {
        initialAlgoParams[p.name] = p.type === "INTEGER" ? parseInt(p.defaultValue ?? 0, 10) :
                                   p.type === "DOUBLE" ? parseFloat(p.defaultValue ?? 0) :
                                   // --- ZMIANA: Poprawna obsługa typu BOOLEAN ---
                                   p.type === "BOOLEAN" ? p.defaultValue ?? false :
                                   p.defaultValue ?? "";
      });
    }

    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      newTasks[panelId] = {
        name: algo?.name,
        algorithmParameters: initialAlgoParams,
      };
      return newTasks;
    });
  };

  const handleParamChange = (name, value, type) => {
    const v = type === "INTEGER" ? parseInt(value, 10) || 0 :
              type === "DOUBLE" ? parseFloat(value) || 0.0 :
              // --- ZMIANA: Poprawna obsługa typu BOOLEAN ---
              type === "BOOLEAN" ? value :
              value;
    
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      if (newTasks[panelId]) {
        newTasks[panelId] = {
          ...newTasks[panelId],
          algorithmParameters: {
            ...newTasks[panelId].algorithmParameters,
            [name]: v,
          },
        };
      }
      return newTasks;
    });
  };

  return (
    <div className="panel algorithm-panel">
      <div className="panel-title-bar">
        <h3>Algorytm #{panelId + 1}</h3>
        {canBeRemoved && (
          <button onClick={() => onRemove(panelId)} className="remove-panel-button" title="Usuń ten algorytm">
            ✕
          </button>
        )}
      </div>
      <select
        value={selectedAlgorithm?.name || ""}
        onChange={(e) => handleAlgorithmSelect(e.target.value)}
        className="select"
      >
        <option value="">Wybierz algorytm...</option>
        {algorithms.map((a) => (<option key={a.name} value={a.name}>{a.name}</option>))}
      </select>
      
      {selectedAlgorithm?.parameters?.map((param) => (
        <InputField
          key={param.name}
          label={param.displayName || param.name}
          description={param.description}
          type={param.type === "DOUBLE" || param.type === "INTEGER" ? "number" : "text"}
          value={currentTask.algorithmParameters?.[param.name] ?? ''}
          step={param.type === "DOUBLE" ? 0.1 : 1}
          min={param.minValue}
          max={param.maxValue}
          // --- ZMIANA: Przekazujemy prop do obsługi checkboxa ---
          isCheckbox={param.type === "BOOLEAN"}
          onChange={(value) => handleParamChange(param.name, value, param.type)}
        />
      ))}
      {problemName && !selectedAlgorithm && <div className="info-text"><small>Wybierz algorytm do porównania.</small></div>}
    </div>
  );
}

