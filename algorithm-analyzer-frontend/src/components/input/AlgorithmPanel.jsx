import { useState, useEffect } from "react";
import InputField from "../../uiComponents/InputField";

export default function AlgorithmPanel({ algorithms, currentTask, setCurrentTask, selectedProblemName }) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  useEffect(() => {
    if (!selectedAlgorithm || !Array.isArray(selectedAlgorithm.parameters)) return;

    const initialAlgoParams = {};
    selectedAlgorithm.parameters.forEach((p) => {
      initialAlgoParams[p.name] = p.type === "INTEGER" 
        ? parseInt(p.defaultValue ?? 0, 10) 
        : p.type === "DOUBLE" 
        ? parseFloat(p.defaultValue ?? 0) 
        : p.defaultValue ?? "";
    });

    // Ustawia nazwę algorytmu i TYLKO jego parametry
    setCurrentTask(prev => ({
      ...prev,
      type: "algorithm",
      name: selectedAlgorithm.name,
      algorithmParameters: initialAlgoParams,
    }));
  }, [selectedAlgorithm, setCurrentTask]);

  const handleParamChange = (name, value, type) => {
    let v = value;
    if (type === "INTEGER") v = parseInt(value, 10) || 0;
    if (type === "DOUBLE") v = parseFloat(value) || 0.0;

    // Aktualizuje TYLKO parametry algorytmu w globalnym stanie
    setCurrentTask(prev => ({
      ...prev,
      algorithmParameters: {
        ...prev.algorithmParameters,
        [name]: v,
      },
    }));
  };

  return (
    <div className="panel">
      <h3>Konfiguracja Algorytmu</h3>
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
          value={currentTask.algorithmParameters[param.name] ?? ''}
          step={param.type === "DOUBLE" ? 0.1 : 1}
          min={param.minValue}
          max={param.maxValue}
          onChange={(value) => handleParamChange(param.name, value, param.type)}
        />
      ))}

      {selectedProblemName && (
        <div className="info-text">
          <small>Powiązany problem: <strong>{selectedProblemName}</strong></small>
        </div>
      )}
    </div>
  );
}