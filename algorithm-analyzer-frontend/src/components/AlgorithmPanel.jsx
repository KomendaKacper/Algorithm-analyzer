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
    <div className="algorithm-panel">
      <h3>Algorytmy</h3>
      <select
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
          onChange={handleParamChange}
        />
      ))}
      <button onClick={handleExecute}>Wykonaj</button>

      {result && (
        <div className="algorithm-result">
          {result.success ? (
            <div>
              <p>Ścieżka: {result.path?.join(" → ")}</p>
              <p>Długość: {result.pathLength?.toFixed(2)}</p>
              <p>Czas: {result.executionDurationMs}ms</p>

              {result?.iterationResults &&
                result.iterationResults.length > 0 && (
                  <>
                    <h4>Postęp w iteracjach</h4>
                    <table border="1" cellPadding="5">
                      <thead>
                        <tr>
                          <th>Iteracja</th>
                          <th>Najlepsza ścieżka</th>
                          <th>Długość</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.iterationResults.map((ir, idx) => (
                          <tr key={idx}>
                            <td>{ir.iteration}</td>
                            <td>{ir.bestPath?.join(" → ") || "-"}</td>
                            <td>{ir.bestDistance.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
            </div>
          ) : (
            <p className="error"></p>
          )}
        </div>
      )}
    </div>
  );
}
