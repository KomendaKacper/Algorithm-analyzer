import { useState, useEffect, useRef } from "react";
import InputField from "../uiComponents/InputField";

export default function AlgorithmPanel({
  algorithms,
  selectedGraph,
  onExecuteAlgorithm,
  result,
}) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [parameters, setParameters] = useState({});
  const [errors, setErrors] = useState({});
  const errorTimers = useRef({}); // przechowuje timery dla transient errors

  useEffect(() => {
    // inicjalizacja parametrów gdy zmieni się wybrany algorytm
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
      setErrors({});
      // wyczyść timery
      Object.values(errorTimers.current).forEach((t) => clearTimeout(t));
      errorTimers.current = {};
    } else {
      setParameters({});
      setErrors({});
    }
  }, [selectedAlgorithm]);

  // pomocnik czyszczący timer dla parametru
  const clearErrorTimer = (name) => {
    if (errorTimers.current[name]) {
      clearTimeout(errorTimers.current[name]);
      delete errorTimers.current[name];
    }
  };

  const handleParamChange = (name, rawValue, type, min, max) => {
    // rawValue pochodzi z inputa jako string (InputField przekazuje e.target.value)
    // pozwalamy na pusty string, żeby użytkownik mógł kasować/edytować
    if (type === "BOOLEAN") {
      setParameters((prev) => ({ ...prev, [name]: Boolean(rawValue) }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // jeśli pusty, ustaw pusty i wyczyść błąd (pozwala na edycję)
    if (rawValue === "" || rawValue === null || rawValue === undefined) {
      setParameters((prev) => ({ ...prev, [name]: "" }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
      clearErrorTimer(name);
      return;
    }

    // parsowanie
    let parsed;
    if (type === "INTEGER") parsed = parseInt(rawValue, 10);
    else if (type === "DOUBLE") parsed = parseFloat(rawValue);
    else parsed = rawValue; // np. NODE_ID lub text

    // obsługa nieprawidłowej liczby (np. wpisano literę) -> pokaż błąd
    if ((type === "INTEGER" || type === "DOUBLE") && Number.isNaN(parsed)) {
      setParameters((prev) => ({ ...prev, [name]: rawValue }));
      setErrors((prev) => ({ ...prev, [name]: "Nieprawidłowa liczba" }));
      return;
    }

    // walidacja zakresu i przycinanie
    let clipped = parsed;
    let clippedBecauseOutOfRange = false;

    if ((type === "INTEGER" || type === "DOUBLE")) {
      if (min != null && parsed < min) {
        clipped = min;
        clippedBecauseOutOfRange = true;
      }
      if (max != null && parsed > max) {
        clipped = max;
        clippedBecauseOutOfRange = true;
      }
    }

    // ustaw wartość (jeżeli to była liczba to ustawiamy liczbę)
    setParameters((prev) => ({ ...prev, [name]: clipped }));

    // jeśli przycięto wartość -> pokaż krótką wiadomość i usuń ją po czasie
    if (clippedBecauseOutOfRange) {
      // wyczyść poprzedni timer
      clearErrorTimer(name);

      setErrors((prev) => ({ ...prev, [name]: `Maksymalna wartość to ${clipped}` }));

      // ustaw timer, żeby ukryć komunikat po 1.5s
      errorTimers.current[name] = setTimeout(() => {
        setErrors((prev) => ({ ...prev, [name]: "" }));
        delete errorTimers.current[name];
      }, 1500);
    } else {
      // poprawna wartość wewnątrz zakresu -> usuń błąd
      setErrors((prev) => ({ ...prev, [name]: "" }));
      clearErrorTimer(name);
    }
  };

  const handleExecute = () => {
    if (!selectedAlgorithm || !selectedGraph) return;
    // końcowa walidacja: jeżeli jakiś required parametr jest pusty -> nie wykonujemy
    const missingRequired = (selectedAlgorithm.parameters || []).some((p) => {
      if (!p.required) return false;
      const v = parameters[p.name];
      // traktujemy null/undefined/empty string jako brak
      return v === "" || v === null || v === undefined;
    });
    if (missingRequired) {
      // możesz tu ustawić błędy dla brakujących
      const newErrors = {};
      (selectedAlgorithm.parameters || []).forEach((p) => {
        if (p.required) {
          const v = parameters[p.name];
          if (v === "" || v === null || v === undefined) {
            newErrors[p.name] = "Pole wymagane";
          }
        }
      });
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // wyślij parametry
    onExecuteAlgorithm(selectedAlgorithm.name, parameters);
  };

  // czy blokować przycisk Wykonaj?
  const hasErrors = Object.values(errors).some((e) => e && e.length > 0);
  const missingRequired = selectedAlgorithm
    ? (selectedAlgorithm.parameters || []).some((p) =>
        p.required ? (parameters[p.name] === "" || parameters[p.name] === null || parameters[p.name] === undefined) : false
      )
    : false;

  return (
    <div className="panel">
      <h3>Algorytmy</h3>

      <select
        className="panel-select"
        value={selectedAlgorithm?.name || ""}
        onChange={(e) =>
          setSelectedAlgorithm(algorithms.find((a) => a.name === e.target.value))
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
          type={param.type === "DOUBLE" || param.type === "INTEGER" ? "number" : "text"}
          value={parameters[param.name]}
          step={param.type === "DOUBLE" ? 0.01 : 1}
          min={param.minValue}
          max={param.maxValue}
          placeholder={param.description}
          error={errors[param.name]}
          onChange={(value) =>
            handleParamChange(param.name, value, param.type, param.minValue, param.maxValue)
          }
        />
      ))}

      <button
        onClick={handleExecute}
        className="panel-button"
        disabled={!selectedAlgorithm || !selectedGraph || hasErrors || missingRequired}
      >
        Wykonaj
      </button>
    </div>
  );
}
