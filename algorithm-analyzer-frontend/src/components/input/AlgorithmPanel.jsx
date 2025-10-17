import { useState, useEffect } from "react";
import InputField from "../../uiComponents/InputField";

export default function AlgorithmPanel({ panelId, algorithms, tasks, setTasks, problemName }) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  
  // Pobieramy dane dla tego konkretnego panelu
  const currentTask = tasks[panelId] || {};

  useEffect(() => {
    if (!selectedAlgorithm) return;

    const initialAlgoParams = {};
    selectedAlgorithm.parameters.forEach(p => {
      initialAlgoParams[p.name] = p.type === "INTEGER" ? parseInt(p.defaultValue ?? 0, 10) :
                                 p.type === "DOUBLE" ? parseFloat(p.defaultValue ?? 0) :
                                 p.defaultValue ?? "";
    });
    
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      newTasks[panelId] = {
        name: selectedAlgorithm.name,
        algorithmParameters: initialAlgoParams,
      };
      return newTasks;
    });
  }, [selectedAlgorithm, panelId, setTasks]);

  const handleParamChange = (name, value, type) => {
    let v = type === "INTEGER" ? parseInt(value, 10) || 0 :
            type === "DOUBLE" ? parseFloat(value) || 0.0 :
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
      <h3>Konfiguracja Algorytmu #{panelId + 1}</h3>
      <select
        value={selectedAlgorithm?.name || ""}
        onChange={(e) => {
          const algo = algorithms.find((a) => a.name === e.target.value) || null;
          setSelectedAlgorithm(algo);
        }}
      >
        <option value="">Wybierz algorytm...</option>
        {algorithms.map((a) => (<option key={a.name} value={a.name}>{a.name}</option>))}
      </select>
      
      {selectedAlgorithm?.parameters?.map((param) => (
        <InputField
          key={param.name}
          label={param.displayName || param.name}
          type={param.type === "DOUBLE" || param.type === "INTEGER" ? "number" : "text"}
          value={currentTask.algorithmParameters?.[param.name] ?? ''}
          step={param.type === "DOUBLE" ? 0.1 : 1}
          min={param.minValue}
          max={param.maxValue}
          onChange={(value) => handleParamChange(param.name, value, param.type)}
        />
      ))}
      {problemName && !selectedAlgorithm && <div className="info-text"><small>Wybierz algorytm do porównania.</small></div>}
    </div>
  );
}