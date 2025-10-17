package com.example.algorithm_analyzer.problems;

import java.util.List;
import java.util.Map;

/**
 * Opcjonalna klasa bazowa dla problemów.
 * Dostarcza wspólną funkcjonalność i walidację.
 */
public abstract class AbstractProblem implements Problem {

    protected boolean initialized = false;

    /**
     * Sprawdza czy problem został zainicjalizowany
     */
    protected void checkInitialized() {
        if (!initialized) {
            throw new IllegalStateException(
                    "Problem '" + getName() + "' nie został zainicjalizowany! " +
                            "Wywołaj metodę initialize() przed użyciem."
            );
        }
    }

    /**
     * Walidacja parametrów inicjalizacji
     */
    protected void validateParameter(Map<String, Object> parameters, String paramName, Class<?> expectedType) {
        if (!parameters.containsKey(paramName)) {
            throw new IllegalArgumentException(
                    "Brak wymaganego parametru: " + paramName
            );
        }

        Object value = parameters.get(paramName);
        if (value == null) {
            throw new IllegalArgumentException(
                    "Parametr " + paramName + " nie może być null"
            );
        }

        if (!expectedType.isInstance(value)) {
            throw new IllegalArgumentException(
                    "Parametr " + paramName + " ma nieprawidłowy typ. " +
                            "Oczekiwano: " + expectedType.getSimpleName() +
                            ", otrzymano: " + value.getClass().getSimpleName()
            );
        }
    }

    /**
     * Konwersja mapy z różnymi typami liczbowymi na Map<String, Integer>
     */
    protected Map<String, Integer> convertToIntegerMap(Map<?, ?> map) {
        java.util.Map<String, Integer> result = new java.util.HashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            String key = entry.getKey().toString();
            Integer value = entry.getValue() instanceof Number
                    ? ((Number) entry.getValue()).intValue()
                    : Integer.parseInt(entry.getValue().toString());
            result.put(key, value);
        }
        return result;
    }

    /**
     * Konwersja mapy z różnymi typami liczbowymi na Map<String, Double>
     */
    protected Map<String, Double> convertToDoubleMap(Map<?, ?> map) {
        java.util.Map<String, Double> result = new java.util.HashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            String key = entry.getKey().toString();
            Double value = entry.getValue() instanceof Number
                    ? ((Number) entry.getValue()).doubleValue()
                    : Double.parseDouble(entry.getValue().toString());
            result.put(key, value);
        }
        return result;
    }

    /**
     * Konwersja listy obiektów na listę stringów
     */
    protected List<String> convertToStringList(List<?> list) {
        return list.stream()
                .map(Object::toString)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Bezpieczne pobranie parametru z domyślną wartością
     */
    @SuppressWarnings("unchecked")
    protected <T> T getParameter(Map<String, Object> parameters, String key, T defaultValue) {
        Object value = parameters.get(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return (T) value;
        } catch (ClassCastException e) {
            throw new IllegalArgumentException(
                    "Nieprawidłowy typ parametru '" + key + "': " + e.getMessage()
            );
        }
    }

    /**
     * Domyślna implementacja klucza feromonowego
     */
    @Override
    public String getPheromoneKey(String from, String to) {
        return (from != null ? from : "START") + "->" + to;
    }

    /**
     * Domyślnie problemy są minimalizacyjne
     */
    @Override
    public boolean isMaximization() {
        return false;
    }

    @Override
    public String toString() {
        return getName() + " (" + (initialized ? "zainicjalizowany" : "niezainicjalizowany") + ")";
    }
}