import { useState, useEffect } from "react";
import InputField from "../uiComponents/InputField";

export default function AlgorithmPanel({
  algorithms,
  selectedGraph,
  onExecuteAlgorithm,
  result,
}) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [parameters, setParameters] = useState({});

  useEffect(() => {
    if (selectedAlgorithm && Array.isArray(selectedAlgorithm.parameters)) {
      const initialParams = {};
      selectedAlgorithm.parameters.forEach((param) => {
        if (param.type === "INTEGER") {
          initialParams[param.name] = param.defaultValue ?? 0;
        } else if (param.type === "DOUBLE") {
          initialParams[param.name] = parseFloat(param.defaultValue ?? 0.0);
        } else {
          initialParams[param.name] = param.defaultValue ?? "";
        }
      });
      setParameters(initialParams);
    } else {
      setParameters({});
    }
  }, [selectedAlgorithm]);

  const handleParamChange = (name, value, type) => {
    let parsedValue = value;
    if (type === "INTEGER") parsedValue = parseInt(value, 10);
    if (type === "DOUBLE") parsedValue = parseFloat(value);
    if (type === "BOOLEAN") parsedValue = Boolean(value);
    setParameters((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleExecute = () => {
    if (!selectedAlgorithm || !selectedGraph) return;
    onExecuteAlgorithm(selectedAlgorithm.name, parameters);
  };

  return (
    <div className="panel">
      <h3>Algorytmy</h3>
      <select className="panel-select"
        value={selectedAlgorithm?.name || ""}
        onChange={(e) =>
          setSelectedAlgorithm(
            algorithms.find((a) => a.name === e.target.value)
          )
        }
      >
        <option value="">Wybierz algorytm</option>
        {algorithms.map((algo) => (
          <option key={algo.name} value={algo.name}>
            {algo.name}
          </option>
        ))}
      </select>

      {selectedAlgorithm?.parameters?.map((param) => (
        <InputField
          key={param.name}
          label={param.displayName}
          param={param}
          value={parameters[param.name]}
          onChange={(value) => handleParamChange(param.name, value, param.type)}
        />
      ))}
      <button onClick={handleExecute} className="panel-button">Wykonaj</button>
    </div>
  );
}
