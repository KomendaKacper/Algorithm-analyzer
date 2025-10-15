package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Problem plecakowy (0/1 Knapsack) – wersja duża do testów ACO
 */
@Component
public class KnapsackProblem extends AbstractProblem {

    // Parametry problemu
    private final List<String> items;
    private final Map<String, Integer> weights;
    private final Map<String, Integer> values;
    private final int capacity;

    // Konstruktor z domyślnymi wartościami (duży problem)
    public KnapsackProblem() {
        int n = 500; // liczba przedmiotów
        List<String> tempItems = new ArrayList<>();
        Map<String, Integer> tempWeights = new HashMap<>();
        Map<String, Integer> tempValues = new HashMap<>();
        int tempCapacity = 0;

        Random rnd = new Random(42); // dla powtarzalności

        for (int i = 1; i <= n; i++) {
            String name = "item" + i;
            int weight = 1 + rnd.nextInt(100); // waga 1-100
            int value = 10 + rnd.nextInt(1000); // wartość 10-1000

            tempItems.add(name);
            tempWeights.put(name, weight);
            tempValues.put(name, value);

            tempCapacity += weight;
        }

        this.items = tempItems;
        this.weights = tempWeights;
        this.values = tempValues;
        this.capacity = tempCapacity / 2; // pojemność ~50% sumy wag
    }

    @Override
    protected void performInitialization() {
        if (items == null || weights == null || values == null) {
            throw new IllegalArgumentException("KnapsackProblem wymaga parametrów: items, weights, values");
        }
    }

    @Override
    public String getName() {
        return "Knapsack Problem";
    }

    @Override
    public String getDescription() {
        return "Klasyczny problem plecakowy 0/1 – duży problem testowy dla ACO";
    }

    @Override
    public double evaluateSolution(List<String> solution) {
        checkInitialized();
        int totalWeight = 0;
        int totalValue = 0;

        for (String item : solution) {
            totalWeight += weights.getOrDefault(item, 0);
            totalValue += values.getOrDefault(item, 0);
        }

        if (totalWeight > capacity) {
            return Double.MAX_VALUE; // nieważne rozwiązanie
        }

        return 1.0 / (totalValue + 1e-6); // minimalizacja funkcji celu
    }

    @Override
    public boolean isValidSolution(List<String> solution) {
        checkInitialized();
        int totalWeight = 0;
        for (String item : solution) {
            totalWeight += weights.getOrDefault(item, 0);
        }
        return totalWeight <= capacity;
    }

    @Override
    public double getHeuristicValue(String current, String next) {
        int value = values.getOrDefault(next, 0);
        int weight = weights.getOrDefault(next, 1);
        return (double) value / weight;
    }

    @Override
    public List<String> getPossibleNextElements(String current, List<String> alreadySelected) {
        checkInitialized();
        List<String> remaining = new ArrayList<>();
        for (String item : items) {
            if (!alreadySelected.contains(item)) {
                remaining.add(item);
            }
        }
        return remaining;
    }

    @Override
    public String getStartElement() {
        return null; // brak elementu startowego
    }

    @Override
    public boolean isSolutionComplete(List<String> solution) {
        checkInitialized();
        int totalWeight = 0;
        for (String item : solution) {
            totalWeight += weights.getOrDefault(item, 0);
            if (totalWeight >= capacity) return true;
        }
        return solution.size() >= items.size();
    }

    @Override
    public List<String> getAllElements() {
        return items;
    }

    @Override
    public List<ParameterDefinition> getParameters() {
        return List.of(
                new ParameterDefinition("items", "Przedmioty", ParameterType.LIST, items, null, null,
                        "Lista dostępnych przedmiotów do plecaka", true),
                new ParameterDefinition("weights", "Wagi przedmiotów", ParameterType.MAP, weights, null, null,
                        "Mapa wag dla każdego przedmiotu", true),
                new ParameterDefinition("values", "Wartości przedmiotów", ParameterType.MAP, values, null, null,
                        "Mapa wartości dla każdego przedmiotu", true),
                new ParameterDefinition("capacity", "Pojemność plecaka", ParameterType.INTEGER, capacity, 1, 100000,
                        "Maksymalna pojemność plecaka", true)
        );
    }
}
