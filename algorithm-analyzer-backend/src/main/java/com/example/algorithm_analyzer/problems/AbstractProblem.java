package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.entity.Graph;
import java.util.List;
import java.util.Map;

/**
 * Abstrakcyjna klasa bazowa dla problemów optymalizacyjnych
 * Zawiera wspólną logikę dla wszystkich problemów
 */
public abstract class AbstractProblem implements Problem {

    protected Graph graph;
    protected Map<String, Object> parameters;
    protected boolean initialized = false;

    @Override
    public void initialize(Graph graph, Map<String, Object> parameters) {
        this.graph = graph;
        this.parameters = parameters;
        this.initialized = true;
        performInitialization();
    }

    /**
     * Metoda do nadpisania przez konkretne implementacje
     * Wywoływana po ustawieniu graph i parameters
     */
    protected abstract void performInitialization();

    /**
     * Sprawdza czy problem został zainicjalizowany
     */
    protected void checkInitialized() {
        if (!initialized) {
            throw new IllegalStateException("Problem nie został zainicjalizowany. Wywołaj initialize() przed użyciem.");
        }
    }

    @Override
    public String getPheromoneKey(String from, String to) {
        return from + "-" + to;
    }

    /**
     * Pomocnicza metoda do pobierania parametrów z bezpieczną konwersją typu
     */
    protected <T> T getParameter(String key, T defaultValue, Class<T> type) {
        if (parameters == null || !parameters.containsKey(key)) {
            return defaultValue;
        }

        Object value = parameters.get(key);
        if (type.isInstance(value)) {
            return type.cast(value);
        }

        // Konwersja liczbowa
        if (value instanceof Number) {
            Number num = (Number) value;
            if (type == Integer.class) {
                return type.cast(num.intValue());
            } else if (type == Double.class) {
                return type.cast(num.doubleValue());
            } else if (type == Long.class) {
                return type.cast(num.longValue());
            }
        }

        return defaultValue;
    }
}