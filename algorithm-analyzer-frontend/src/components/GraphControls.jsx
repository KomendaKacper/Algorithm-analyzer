import { useState } from "react";

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

  const handleGenerate = () => {
    if (!validate()) return;
    onGenerateRandom({
      name: graphName,
      numNodes: Number(quantityOfNodes),
      density: Number(graphDensity),
      directed: isDirected,
      maxWeight: Number(maxWeight),
    });
  };

  return (
    <div className="controls-container">
      <button onClick={handleGenerate} className="controls-generate-button">
        Generuj losowy graf
      </button>
      <select
        className="controls-select"
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
      <div className="controls-inputs">
        <div>
          <label className="controls-label">Nazwa grafu</label>
          <input
            type="text"
            placeholder="Nazwa grafu.."
            className="controls-input"
            value={graphName}
            onChange={(e) => setGraphName(e.target.value)}
          />
          {errors.graphName && (
            <p className="controls-error">{errors.graphName}</p>
          )}
        </div>
        <div>
          <label className="controls-label">Liczba węzłów</label>
          <input
            type="number"
            placeholder="Liczba węzłów.."
            className="controls-input"
            value={quantityOfNodes}
            onChange={(e) => setQuantityOfNodes(e.target.value)}
          />
          {errors.quantityOfNodes && (
            <p className="controls-error">{errors.quantityOfNodes}</p>
          )}
        </div>
        <div>
          <label className="controls-label">Zagęszczenie krawędzi [0,1]</label>
          <input
            type="number"
            placeholder="Zagęszczenie krawędzi.."
            className="controls-input"
            value={graphDensity}
            onChange={(e) => setGraphDensity(e.target.value)}
            step="0.1"
          />
          {errors.graphDensity && (
            <p className="controls-error">{errors.graphDensity}</p>
          )}
        </div>
        <div>
          <label className="controls-label">Maksymalna waga krawędzi</label>
          <input
            type="number"
            placeholder="Maksymalna waga krawędzi.."
            className="controls-input"
            value={maxWeight}
            onChange={(e) => setMaxWeight(e.target.value)}
          />
          {errors.maxWeight && (
            <p className="controls-error">{errors.maxWeight}</p>
          )}
        </div>
        <div className="controls-checkbox-container">
          <label className="controls-checkbox-label">Czy skierowany?</label>
          <input
            type="checkbox"
            id="isDirected"
            className="controls-checkbox"
            name="isDirected"
            onChange={(e) => setIsDirected(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}
