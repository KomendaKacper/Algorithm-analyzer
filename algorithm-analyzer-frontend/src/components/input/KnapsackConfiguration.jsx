import { useState, useEffect } from "react";
import { getPredefinedKnapsackInstances, generateKnapsackInstance } from "../../api/knapsackApi";

export default function KnapsackConfiguration({ onInstanceSelected }) {
  const [mode, setMode] = useState("predefined");
  const [predefinedInstances, setPredefinedInstances] = useState([]);
  const [selectedPredefined, setSelectedPredefined] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [generateParams, setGenerateParams] = useState({
    numberOfItems: 10, minWeight: 1, maxWeight: 20,
    minValue: 10, maxValue: 100, capacityRatio: 0.5,
  });
  
  const [customItems, setCustomItems] = useState([{ name: "Przedmiot1", weight: 5, value: 10 }]);
  const [customCapacity, setCustomCapacity] = useState(10);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    getPredefinedKnapsackInstances()
      .then(res => {
        const data = res.data;
        setPredefinedInstances(data);
        if (data && data.length > 0) {
          setSelectedPredefined(0);
          onInstanceSelected(data[0]);
        }
      })
      .catch(err => {
        console.error("Error fetching predefined instances:", err);
        setError(err.message || "Nie udało się pobrać predefiniowanych instancji.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [onInstanceSelected]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateKnapsackInstance(generateParams);
      onInstanceSelected(response.data);
    } catch (err) {
      setError(err.message || "Błąd podczas generowania instancji.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredefinedSelect = (indexStr) => {
    const index = parseInt(indexStr, 10);
    setSelectedPredefined(index);
    if (predefinedInstances[index]) {
      onInstanceSelected(predefinedInstances[index]);
    }
  };

  const handleCustomSubmit = () => {
    const items = customItems.map(item => item.name);
    const weights = Object.fromEntries(customItems.map(item => [item.name, item.weight]));
    const values = Object.fromEntries(customItems.map(item => [item.name, item.value]));
    
    const instance = { name: "Własna Instancja", items, weights, values, capacity: customCapacity };
    onInstanceSelected(instance);
  };

  const addCustomItem = () => setCustomItems([...customItems, { name: `Przedmiot${customItems.length + 1}`, weight: 1, value: 1 }]);
  const updateCustomItem = (index, field, value) => {
    const newItems = [...customItems];
    newItems[index][field] = field === "name" ? value : parseInt(value) || 0;
    setCustomItems(newItems);
  };
  const removeCustomItem = (index) => {
    if (customItems.length > 1) setCustomItems(customItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800">Konfiguracja Knapsack Problem</h3>
      
      {error && <div className="p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm"><strong>Błąd:</strong> {error}</div>}
      {loading && <div className="p-3 bg-blue-100 border border-blue-400 rounded text-blue-700 text-sm">Ładowanie...</div>}
      
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("predefined")} className={`px-4 py-2 rounded ${mode === "predefined" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>Gotowe</button>
        <button onClick={() => setMode("generate")} className={`px-4 py-2 rounded ${mode === "generate" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>Generuj</button>
        <button onClick={() => setMode("custom")} className={`px-4 py-2 rounded ${mode === "custom" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>Własne</button>
      </div>

      {mode === "predefined" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Wybierz przykład:</label>
          <select value={selectedPredefined} onChange={(e) => handlePredefinedSelect(e.target.value)} className="w-full p-2 border rounded">
            {predefinedInstances.map((instance, index) => (<option key={index} value={index}>{instance.name}</option>))}
          </select>
        </div>
      )}

      {mode === "generate" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Liczba przedmiotów</label>
              <input type="number" value={generateParams.numberOfItems} onChange={(e) => setGenerateParams({...generateParams, numberOfItems: parseInt(e.target.value) || 1})} min="1" max="100" className="w-full p-2 border rounded"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pojemność (% sumy wag)</label>
              <input type="number" value={generateParams.capacityRatio * 100} onChange={(e) => setGenerateParams({...generateParams, capacityRatio: (parseInt(e.target.value) || 50) / 100})} min="10" max="90" step="5" className="w-full p-2 border rounded"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zakres wag</label>
              <div className="flex gap-2">
                <input type="number" value={generateParams.minWeight} onChange={(e) => setGenerateParams({...generateParams, minWeight: parseInt(e.target.value) || 1})} placeholder="Min" className="w-full p-2 border rounded"/>
                <input type="number" value={generateParams.maxWeight} onChange={(e) => setGenerateParams({...generateParams, maxWeight: parseInt(e.target.value) || 20})} placeholder="Max" className="w-full p-2 border rounded"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zakres wartości</label>
              <div className="flex gap-2">
                <input type="number" value={generateParams.minValue} onChange={(e) => setGenerateParams({...generateParams, minValue: parseInt(e.target.value) || 10})} placeholder="Min" className="w-full p-2 border rounded"/>
                <input type="number" value={generateParams.maxValue} onChange={(e) => setGenerateParams({...generateParams, maxValue: parseInt(e.target.value) || 100})} placeholder="Max" className="w-full p-2 border rounded"/>
              </div>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading} className="w-full py-2 bg-green-500 text-white rounded font-medium disabled:opacity-50">
            {loading ? "Generowanie..." : "Generuj instancję"}
          </button>
        </div>
      )}

      {mode === "custom" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pojemność plecaka</label>
            <input type="number" value={customCapacity} onChange={(e) => setCustomCapacity(parseInt(e.target.value) || 0)} min="1" className="w-full p-2 border rounded"/>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2 p-1">
            {customItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-center bg-white p-2 rounded border">
                <input type="text" value={item.name} onChange={(e) => updateCustomItem(index, "name", e.target.value)} placeholder="Nazwa" className="flex-1 p-1 border rounded text-sm"/>
                <input type="number" value={item.weight} onChange={(e) => updateCustomItem(index, "weight", e.target.value)} placeholder="Waga" min="1" className="w-20 p-1 border rounded text-sm"/>
                <input type="number" value={item.value} onChange={(e) => updateCustomItem(index, "value", e.target.value)} placeholder="Wartość" min="1" className="w-20 p-1 border rounded text-sm"/>
                <button onClick={() => removeCustomItem(index)} className="px-2 py-1 bg-red-500 text-white rounded text-sm" disabled={customItems.length === 1}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={addCustomItem} className="w-full py-2 bg-blue-500 text-white rounded">+ Dodaj przedmiot</button>
          <button onClick={handleCustomSubmit} className="w-full py-2 bg-green-500 text-white rounded font-medium">Zatwierdź konfigurację</button>
        </div>
      )}
    </div>
  );
}