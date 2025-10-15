import { useState, useEffect } from "react";
import InputField from "../../uiComponents/InputField";
import { getProblems, getProblemByName } from "../../api/problemApi";

export default function ProblemPanel({ setCurrentTask }) {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [parameters, setParameters] = useState({});

  // mapowanie problem → algorytm
  const problemAlgorithmMap = {
    "Traveling Salesman Problem (TSP)": "Ant Colony Optimization (ACO)",
    "Knapsack Problem": "Genetic Algorithm",
  };

  useEffect(() => {
    getProblems()
      .then((res) => setProblems(res.data))
      .catch(console.error);
  }, []);

  const handleSelectProblem = async (name) => {
    if (!name) {
      setSelectedProblem(null);
      setParameters({});
      setCurrentTask({ type: null, name: null, parameters: {} });
      return;
    }

    const res = await getProblemByName(name);
    setSelectedProblem(res.data);

    const initialParams = {};
    res.data.parameters.forEach((p) => {
      if (p.type === "INTEGER") initialParams[p.name] = p.defaultValue ?? 0;
      else if (p.type === "DOUBLE") initialParams[p.name] = parseFloat(p.defaultValue ?? 0);
      else initialParams[p.name] = p.defaultValue ?? "";
    });

    setParameters(initialParams);

    const linkedAlgorithm = problemAlgorithmMap[name] || "Ant Colony Optimization (ACO)";

    // odroczone ustawienie zadania, aby uniknąć błędu React
    setTimeout(() => {
      setCurrentTask({
        type: "algorithm",
        name: linkedAlgorithm,
        problemName: name,
        parameters: initialParams,
      });
    }, 0);
  };

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
      <h3>Problemy</h3>
      <select
        value={selectedProblem?.name || ""}
        onChange={(e) => handleSelectProblem(e.target.value)}
      >
        <option value="">Wybierz problem</option>
        {problems.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      {selectedProblem?.parameters?.map((param) => (
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
    </div>
  );
}