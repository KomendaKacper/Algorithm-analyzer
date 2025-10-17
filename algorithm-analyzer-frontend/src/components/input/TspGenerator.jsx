import React, { useState } from 'react';
import InputField from '../../uiComponents/InputField';

// Komponent do generowania problemów TSP
export default function TspGenerator({ onGenerate }) {
  const [numberOfCities, setNumberOfCities] = useState(5);

  const handleGenerate = () => {
    // 1. Wygeneruj listę miast jako stringi '1', '2', '3', ...
    const cities = Array.from({ length: numberOfCities }, (_, i) => String(i + 1));
    const distances = {};
    const tempDistances = {}; // Używamy do zapewnienia symetrii

    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const fromCity = cities[i];
        const toCity = cities[j];
        // Losowy dystans w zakresie 10-500 km
        const distance = Math.floor(Math.random() * 491) + 10;
        
        // Zapisujemy odległość dla pary miast
        if (!tempDistances[fromCity]) tempDistances[fromCity] = {};
        if (!tempDistances[toCity]) tempDistances[toCity] = {};

        tempDistances[fromCity][toCity] = distance;
        tempDistances[toCity][fromCity] = distance;
      }
    }
    
    // Zbuduj finalny obiekt w wymaganym formacie
    cities.forEach(city => {
        distances[city] = tempDistances[city] || {};
    });

    // Przekaż wygenerowany problem do komponentu nadrzędnego
    onGenerate({ cities, distances });
  };

  return (
    <div className="tsp-generator">
      <h4>Generator Problemu TSP</h4>
      <InputField
        label="Liczba miast"
        type="number"
        value={numberOfCities}
        min={3}
        max={25} // Ustawiamy rozsądny limit, aby nie zawiesić przeglądarki
        step={1}
        onChange={(value) => setNumberOfCities(parseInt(value, 10))}
      />
      <button 
        className="panel-button generate-button" 
        onClick={handleGenerate}
      >
        Wygeneruj
      </button>
    </div>
  );
}