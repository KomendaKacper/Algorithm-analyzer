import { useState } from "react";
import InputField from "../uiComponents/InputField";

export default function GraphControls({
  graphs,
  selectedGraph,
  onSelectGraph,
  onGenerateRandom,
}) {
  const [graphName, setGraphName] = useState("");
  const [quantityOfNodes, setQuantityOfNodes] = useState(10);
  const [graphDensity, setGraphDensity] = useState(0.5);
  const [maxWeight, setMaxWeight] = useState(100);
  const [isDirected, setIsDirected] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!graphName.trim())
      newErrors.graphName = "Nazwa grafu nie może być pusta";
    if (!Number.isInteger(+quantityOfNodes) || quantityOfNodes <= 0)
      newErrors.quantityOfNodes = "Liczba węzłów musi być liczbą całkowitą > 0";
    if (isNaN(graphDensity) || graphDensity < 0 || graphDensity > 1)
      newErrors.graphDensity = "Zagęszczenie musi być w przedziale 0-1";
    if (!Number.isInteger(+maxWeight) || +maxWeight <= 0)
      newErrors.maxWeight = "Maksymalna waga musi być liczbą całkowitą > 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [minWeight, setMinWeight] = useState(1); // dodaj stan dla minWeight

  const handleGenerate = () => {
    if (!validate()) return;
    onGenerateRandom({
      name: graphName,
      nodeCount: Number(quantityOfNodes), // zmieniono z numNodes
      edgeProbability: Number(graphDensity), // zmieniono z density
      directed: isDirected,
      minWeight: Number(minWeight), // dodano brakujące pole
      maxWeight: Number(maxWeight),
    });
  };

  return (
    <div className="panel">
      <h3>Grafy</h3>
      <button onClick={handleGenerate} className="panel-button">
        Generuj losowy graf
      </button>
      <select
        className="panel-select"
        onChange={(e) =>
          onSelectGraph(graphs.find((g) => g.id === parseInt(e.target.value)))
        }
        value={selectedGraph?.id || ""}
      >
        {graphs.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
        <InputField
          label="Nazwa grafu"
          type="text"
          value={graphName}
          onChange={setGraphName}
          error={errors.graphName}
        />

        <InputField
          label="Liczba węzłów"
          type="number"
          value={quantityOfNodes}
          onChange={setQuantityOfNodes}
          error={errors.quantityOfNodes}
        />

        <InputField
          label="Zagęszczenie krawędzi [0,1]"
          type="number"
          value={graphDensity}
          onChange={setGraphDensity}
          error={errors.graphDensity}
          step="0.1"
          min="0"
          max="1"
        />

        <InputField
          label="Minimalna waga krawędzi"
          type="number"
          value={minWeight}
          onChange={setMinWeight}
        />

        <InputField
          label="Maksymalna waga krawędzi"
          type="number"
          value={maxWeight}
          onChange={setMaxWeight}
          error={errors.maxWeight}
        />

        <InputField
          label="Czy graf skierowany?"
          checkbox
          value={isDirected}
          onChange={setIsDirected}
        />
      </div>
  );
}
