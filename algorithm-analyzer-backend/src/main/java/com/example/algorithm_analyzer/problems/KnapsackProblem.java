package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class KnapsackProblem extends AbstractMatrixProblem {

    private Map<String, Integer> weights = new HashMap<>();
    private Map<String, Integer> values = new HashMap<>();
    private int capacity;

    @Override
    public String getName() {
        return "Knapsack Problem";
    }

    @Override
    public String getDescription() {
        return "Problem plecakowy (0-1 Knapsack)";
    }

    @Override
    public void initialize(Map<String, Object> parameters) {
        // bezpieczne rzutowanie
        this.elements = parameters.containsKey("items") ? new ArrayList<>((List<String>) parameters.get("items")) : new ArrayList<>();
        this.weights = parameters.containsKey("weights") ? (Map<String, Integer>) parameters.get("weights") : new HashMap<>();
        this.values = parameters.containsKey("values") ? (Map<String, Integer>) parameters.get("values") : new HashMap<>();
        this.capacity = parameters.containsKey("capacity") ? (Integer) parameters.get("capacity") : 0;

        // heurystyka: wartość/waga
        this.heuristicMatrix = new double[elements.size()][elements.size()];
        for (int i = 0; i < elements.size(); i++) {
            for (int j = 0; j < elements.size(); j++) {
                String item = elements.get(j);
                heuristicMatrix[i][j] = weights.get(item) != 0 ? (double) values.get(item) / weights.get(item) : 0.0;
            }
        }
        this.initialized = true;
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
        if (totalWeight > capacity) return Double.MAX_VALUE; // kara za przekroczenie plecaka
        return 1.0 / (totalValue + 1e-6); // minimalizacja ACO
    }

    @Override
    public boolean isValidSolution(List<String> solution) {
        int totalWeight = 0;
        for (String item : solution) totalWeight += weights.getOrDefault(item, 0);
        return totalWeight <= capacity;
    }

    @Override
    public List<String> getPossibleNextElements(String current, List<String> alreadySelected) {
        List<String> remaining = new ArrayList<>();
        for (String item : elements) {
            if (!alreadySelected.contains(item)) remaining.add(item);
        }
        return remaining;
    }

    @Override
    public String getStartElement() {
        return null; // brak startowego elementu
    }

    @Override
    public boolean isSolutionComplete(List<String> solution) {
        return solution.size() >= elements.size();
    }

    @Override
    public List<ParameterDefinition> getParameters() {
        return List.of(
                new ParameterDefinition("items", "Przedmioty", ParameterType.LIST, elements, null, null, "Lista przedmiotów do wyboru", true),
                new ParameterDefinition("weights", "Wagi", ParameterType.MAP, weights, null, null, "Mapa wag przedmiotów", true),
                new ParameterDefinition("values", "Wartości", ParameterType.MAP, values, null, null, "Mapa wartości przedmiotów", true),
                new ParameterDefinition("capacity", "Pojemność", ParameterType.INTEGER, capacity, 1, 100000, "Pojemność plecaka", true)
        );
    }
}
