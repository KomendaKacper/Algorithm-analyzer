export default function GraphControls({ graphs, selectedGraph, onSelectGraph, onGenerateRandom }) {
  return (
    <div className="controls-container">
      <button
        onClick={onGenerateRandom}
        className="main-controls bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Generuj losowy graf
      </button>

      <select
        onChange={(e) =>
          onSelectGraph(graphs.find((g) => g.id === parseInt(e.target.value)))
        }
        value={selectedGraph?.id || ""}
        className="main-controls border rounded px-2 py-1"
      >
        {graphs.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  );
}
