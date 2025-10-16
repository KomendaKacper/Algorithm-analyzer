import { useState, useEffect } from "react";
import InputField from "../../uiComponents/InputField";

export default function AlgorithmPanel({
  algorithms,
  currentTask,
  setCurrentTask,
  selectedProblemName,
}) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [parameters, setParameters] = useState({});

  useEffect(() => {
    if (!selectedAlgorithm || !Array.isArray(selectedAlgorithm.parameters)) return;

    const initialParams = {};
    selectedAlgorithm.parameters.forEach((p) => {
      if (!p) return;
      if (p.type === "INTEGER") initialParams[p.name] = p.defaultValue ?? 0;
      else if (p.type === "DOUBLE") initialParams[p.name] = parseFloat(p.defaultValue ?? 0);
      else initialParams[p.name] = p.defaultValue ?? "";
    });

    if (selectedProblemName && selectedProblemName !== "default") {
      initialParams.problemName = selectedProblemName;
    }

    setParameters(initialParams);

    setTimeout(() => {
      setCurrentTask({
        type: "algorithm",
        name: selectedAlgorithm.name,
        problemName: selectedProblemName,
        parameters: initialParams,
      });
    }, 0);
  }, [selectedAlgorithm, selectedProblemName, setCurrentTask]);

  const handleParamChange = (name, value, type) => {
    let v = value;
    if (type === "INTEGER") v = parseInt(value, 10);
    if (type === "DOUBLE") v = parseFloat(value);

    const newParams = { ...parameters, [name]: v };
    setParameters(newParams);

    setCurrentTask((prevTask) => ({
      ...prevTask,
      parameters: newParams,
    }));
  };

  return (
    <div className="panel">
      <h3>Algorytmy</h3>

      <select
        value={selectedAlgorithm?.name || ""}
        onChange={(e) => {
          const algo = algorithms.find((a) => a.name === e.target.value) || null;
          setSelectedAlgorithm(algo);
        }}
      >
        <option value="">Wybierz algorytm</option>
        {algorithms.map((a) => (
          <option key={a.name} value={a.name}>
            {a.name}
          </option>
        ))}
      </select>

      {Array.isArray(selectedAlgorithm?.parameters) &&
        selectedAlgorithm.parameters.map((param) => (
          <InputField
            key={param.name}
            label={param.displayName || param.name}
            type={param.type === "DOUBLE" || param.type === "INTEGER" ? "number" : "text"}
            value={parameters[param.name]}
            step={param.type === "DOUBLE" ? 0.1 : 1}
            min={param.minValue}
            max={param.maxValue}
            placeholder={param.description}
            onChange={(value) => handleParamChange(param.name, value, param.type)}
          />
        ))}

      {selectedProblemName && selectedProblemName !== "default" && (
        <div className="info-text">
          <small>
            Powiązany problem: <strong>{selectedProblemName}</strong>
          </small>
        </div>
      )}
    </div>
  );
}
