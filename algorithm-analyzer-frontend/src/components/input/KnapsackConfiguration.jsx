import { useState, useEffect } from "react";

export default function KnapsackConfiguration({ onInstanceSelected }) {
  const [mode, setMode] = useState("predefined");
  const [predefinedInstances, setPredefinedInstances] = useState([]);
  const [selectedPredefined, setSelectedPredefined] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [generateParams, setGenerateParams] = useState({
    numberOfItems: 10,
    minWeight: 1,
    maxWeight: 20,
    minValue: 10,
    maxValue: 100,
    capacityRatio: 0.5,
  });
  
  const [customItems, setCustomItems] = useState([
    { name: "Item1", weight: 5, value: 10 }
  ]);
  const [customCapacity, setCustomCapacity] = useState(10);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch("http://localhost:8080/api/problems/knapsack/predefined")
      .then(async res => {
        console.log("Response status:", res.status);
        console.log("Response headers:", [...res.headers.entries()]);
        
        if (!res.ok) {
          const text = await res.text();
          console.error("Error response:", text);
          throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
        }
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Non-JSON response:", text.substring(0, 200));
          throw new Error("Backend nie zwrócił JSON. Możliwe, że endpoint nie istnieje.");
        }
        
        return res.json();
      })
      .then(data => {
        console.log("Predefined instances loaded:", data);
        setPredefinedInstances(data);
        if (data.length > 0) {
          setSelectedPredefined(0);
          onInstanceSelected(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching predefined instances:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [onInstanceSelected]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Generating with params:", generateParams);
      
      const response = await fetch("http://localhost:8080/api/problems/knapsack/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generateParams),
      });
      
      console.log("Generate response status:", response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error("Generate error:", text);
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Backend nie zwrócił JSON");
      }
      
      const instance = await response.json();
      console.log("Generated instance:", instance);
      onInstanceSelected(instance);
      setLoading(false);
    } catch (error) {
      console.error("Error generating instance:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handlePredefinedSelect = (index) => {
    setSelectedPredefined(index);
    onInstanceSelected(predefinedInstances[index]);
  };

  const handleCustomSubmit = () => {
    const items = customItems.map(item => item.name);
    const weights = {};
    const values = {};
    
    customItems.forEach(item => {
      weights[item.name] = item.weight;
      values[item.name] = item.value;
    });
    
    const instance = {
      name: "Custom Instance",
      items,
      weights,
      values,
      capacity: customCapacity,
    };
    
    console.log("Custom instance created:", instance);
    onInstanceSelected(instance);
  };

  const addCustomItem = () => {
    setCustomItems([
      ...customItems,
      { name: `Item${customItems.length + 1}`, weight: 1, value: 1 }
    ]);
  };

  const updateCustomItem = (index, field, value) => {
    const newItems = [...customItems];
    newItems[index][field] = field === "name" ? value : parseInt(value) || 0;
    setCustomItems(newItems);
  };

  const removeCustomItem = (index) => {
    if (customItems.length > 1) {
      setCustomItems(customItems.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800">Konfiguracja Knapsack Problem</h3>
      
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
          <strong>Błąd:</strong> {error}
          <br />
          <span className="text-xs">Sprawdź konsolę przeglądarki (F12) po więcej szczegółów</span>
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="p-3 bg-blue-100 border border-blue-400 rounded text-blue-700 text-sm">
          Ładowanie...
        </div>
      )}
      
      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("predefined")}
          className={`px-4 py-2 rounded ${
            mode === "predefined" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Predefiniowane
        </button>
        <button
          onClick={() => setMode("generate")}
          className={`px-4 py-2 rounded ${
            mode === "generate" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Generuj
        </button>
        <button
          onClick={() => setMode("custom")}
          className={`px-4 py-2 rounded ${
            mode === "custom" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Własne
        </button>
      </div>

      {/* Predefined Mode */}
      {mode === "predefined" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Wybierz przykład:</label>
          {predefinedInstances.length > 0 ? (
            <>
              <select
                value={selectedPredefined ?? ""}
                onChange={(e) => handlePredefinedSelect(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {predefinedInstances.map((instance, index) => (
                  <option key={index} value={index}>
                    {instance.name}
                  </option>
                ))}
              </select>
              
              {selectedPredefined !== null && predefinedInstances[selectedPredefined] && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-200 text-sm">
                  <div className="font-medium text-gray-700 mb-2">Podgląd:</div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <div>Przedmioty: {predefinedInstances[selectedPredefined].items.length}</div>
                    <div>Pojemność: {predefinedInstances[selectedPredefined].capacity}</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-sm">
              Brak dostępnych predefiniowanych instancji. Sprawdź, czy backend działa.
            </div>
          )}
        </div>
      )}

      {/* Generate Mode */}
      {mode === "generate" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liczba przedmiotów
              </label>
              <input
                type="number"
                value={generateParams.numberOfItems}
                onChange={(e) => setGenerateParams({
                  ...generateParams,
                  numberOfItems: parseInt(e.target.value) || 1
                })}
                min="1"
                max="100"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pojemność (% sumy wag)
              </label>
              <input
                type="number"
                value={generateParams.capacityRatio * 100}
                onChange={(e) => setGenerateParams({
                  ...generateParams,
                  capacityRatio: (parseInt(e.target.value) || 50) / 100
                })}
                min="10"
                max="90"
                step="5"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zakres wag
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={generateParams.minWeight}
                  onChange={(e) => setGenerateParams({
                    ...generateParams,
                    minWeight: parseInt(e.target.value) || 1
                  })}
                  placeholder="Min"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={generateParams.maxWeight}
                  onChange={(e) => setGenerateParams({
                    ...generateParams,
                    maxWeight: parseInt(e.target.value) || 20
                  })}
                  placeholder="Max"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zakres wartości
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={generateParams.minValue}
                  onChange={(e) => setGenerateParams({
                    ...generateParams,
                    minValue: parseInt(e.target.value) || 10
                  })}
                  placeholder="Min"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={generateParams.maxValue}
                  onChange={(e) => setGenerateParams({
                    ...generateParams,
                    maxValue: parseInt(e.target.value) || 100
                  })}
                  placeholder="Max"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generowanie..." : "Generuj instancję"}
          </button>
        </div>
      )}

      {/* Custom Mode */}
      {mode === "custom" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pojemność plecaka
            </label>
            <input
              type="number"
              value={customCapacity}
              onChange={(e) => setCustomCapacity(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {customItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-center bg-white p-2 rounded border border-gray-200">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateCustomItem(index, "name", e.target.value)}
                  placeholder="Nazwa"
                  className="flex-1 p-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  value={item.weight}
                  onChange={(e) => updateCustomItem(index, "weight", e.target.value)}
                  placeholder="Waga"
                  min="1"
                  className="w-20 p-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => updateCustomItem(index, "value", e.target.value)}
                  placeholder="Wartość"
                  min="1"
                  className="w-20 p-1 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => removeCustomItem(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  disabled={customItems.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={addCustomItem}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + Dodaj przedmiot
          </button>
          
          <button
            onClick={handleCustomSubmit}
            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
          >
            Zatwierdź konfigurację
          </button>
        </div>
      )}
    </div>
  );
}