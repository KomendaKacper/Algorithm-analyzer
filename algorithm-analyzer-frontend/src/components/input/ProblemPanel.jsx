import { useState, useEffect } from "react";
import InputField from "../../uiComponents/InputField";
import { getProblems, getProblemByName } from "../../api/problemApi";

export default function ProblemPanel({ setCurrentTask }) {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [parameters, setParameters] = useState({ numberOfCities: 5 }); // domyślnie 5 miast

  const problemAlgorithmMap = {
    "Traveling Salesman Problem (TSP)": "Ant Colony Optimization (ACO)",
    "Knapsack Problem": "Genetic Algorithm",
  };

  useEffect(() => {
    getProblems().then((res) => setProblems(res.data)).catch(console.error);
  }, []);

  const handleSelectProblem = async (name) => {
    if (!name) {
      setSelectedProblem(null);
      setParameters({ numberOfCities: 5 });
      setCurrentTask({ type: null, name: null, problemName: null, parameters: {} });
      return;
    }

    const res = await getProblemByName(name);
    setSelectedProblem(res.data);

    const initialParams = { numberOfCities: 5 }; // domyślny parametr
    setParameters(initialParams);

    const linkedAlgorithm = problemAlgorithmMap[name] || "Ant Colony Optimization (ACO)";
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
      <select value={selectedProblem?.name || ""} onChange={(e) => handleSelectProblem(e.target.value)}>
        <option value="">Wybierz problem</option>
        {problems.map((p) => (
          <option key={p.name} value={p.name}>{p.name}</option>
        ))}
      </select>

      {selectedProblem?.name === "Traveling Salesman Problem (TSP)" && (
        <InputField
          label="Liczba miast"
          type="number"
          value={parameters.numberOfCities}
          min={2}
          max={20}
          step={1}
          onChange={(value) => handleParamChange("numberOfCities", value, "INTEGER")}
        />
      )}
    </div>
  );
}
