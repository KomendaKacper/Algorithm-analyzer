package com.example.algorithm_analyzer.problems;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public abstract class AbstractProblem implements Problem {

    protected boolean initialized = false;

    protected void checkInitialized() {
        if (!initialized) {
            throw new IllegalStateException(
                    "Problem '" + getName() + "' has not been initialized! " +
                            "Call initialize() before use."
            );
        }
    }

    protected void validateParameter(Map<String, Object> parameters, String paramName, Class<?> expectedType) {
        if (!parameters.containsKey(paramName)) {
            throw new IllegalArgumentException(
                    "Missing required parameter: " + paramName
            );
        }

        Object value = parameters.get(paramName);
        if (value == null) {
            throw new IllegalArgumentException(
                    "Parameter " + paramName + " cannot be null"
            );
        }

        if (!expectedType.isInstance(value)) {
            throw new IllegalArgumentException(
                    "Parameter " + paramName + " has invalid type. " +
                            "Expected: " + expectedType.getSimpleName() +
                            ", received: " + value.getClass().getSimpleName()
            );
        }
    }

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

    protected List<String> convertToStringList(List<?> list) {
        return list.stream()
                .map(Object::toString)
                .collect(Collectors.toList());
    }

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
                    "Invalid parameter type '" + key + "': " + e.getMessage()
            );
        }
    }

    @Override
    public String getPheromoneKey(String from, String to) {
        return (from != null ? from : "START") + "->" + to;
    }

    @Override
    public boolean isMaximization() {
        return false;
    }

    @Override
    public String toString() {
        return getName() + " (" + (initialized ? "initialized" : "uninitialized") + ")";
    }
}