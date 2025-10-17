package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class KnapsackProblem extends AbstractProblem implements Problem {

    private Map<String, Integer> weights = new HashMap<>();
    private Map<String, Integer> values = new HashMap<>();
    private List<String> elements = new ArrayList<>();
    private int capacity;

    @Override
    public String getName() { return "Knapsack Problem"; }

    @Override
    public String getDescription() { return "Problem plecakowy (0-1 Knapsack) - oparty na wyborze ścieżkowym."; }

    @Override
    public boolean isMaximization() {
        return true;
    }

    @Override
    @SuppressWarnings("unchecked")
    public void initialize(Map<String, Object> parameters) {
        // Używamy metod pomocniczych z AbstractProblem (zakładając ich istnienie)
        this.elements = convertToStringList(getParameter(parameters, "items", List.of()));
        this.weights = convertToIntegerMap(getParameter(parameters, "weights", Map.of()));
        this.values = convertToIntegerMap(getParameter(parameters, "values", Map.of()));
        this.capacity = getParameter(parameters, "capacity", 0);
        this.initialized = true;
    }

    @Override
    public List<String> convertPathToSolution(List<String> path) {
        // Rozwiązaniem są UNIKALNE elementy, które się w tej ścieżce znalazły.
        return path.stream().distinct().collect(Collectors.toList());
    }

    @Override
    public double evaluateSolution(List<String> solution) {
        checkInitialized();
        int totalWeight = 0;
        int totalValue = 0;

        for (String item : solution) {
            totalWeight += getWeight(item);
            totalValue += values.getOrDefault(item, 0);
        }

        if (totalWeight > capacity) return 0.0; // Kara za przekroczenie
        return totalValue;
    }

    @Override
    public boolean isValidSolution(List<String> solution) {
        int totalWeight = 0;
        for (String item : solution) totalWeight += getWeight(item);
        return totalWeight <= capacity;
    }

    // KnapsackProblem.java - SUGEROWANE POPRAWKI

    @Override
    public List<String> getPossibleNextElements(String current, List<String> alreadySelectedPath) {
        // Oblicz aktualną wagę ścieżki
        int currentWeight = alreadySelectedPath.stream()
                .mapToInt(this::getWeight)
                .sum();

        // Zwróć tylko te przedmioty, których jeszcze nie ma w plecaku I które się zmieszczą
        return elements.stream()
                .filter(item -> !alreadySelectedPath.contains(item)) // Przedmiot nie jest jeszcze w plecaku
                .filter(item -> currentWeight + getWeight(item) <= capacity) // Przedmiot się zmieści
                .collect(Collectors.toList());
    }

    @Override
    public boolean isSolutionComplete(List<String> path) {
        // Rozwiązanie jest kompletne, jeśli nie ma już możliwych ruchów (żaden przedmiot się nie zmieści)
        return getPossibleNextElements(null, path).isEmpty();
    }

    @Override
    public String getStartElement() {
        return null; // Brak ustalonego elementu startowego
    }

    public int getWeight(String item) { return weights.getOrDefault(item, 0); }

    @Override
    public double getHeuristicValue(String current, String next) {
        // Heurystyka to stosunek wartości do wagi
        Integer weight = weights.get(next);
        Integer value = values.get(next);
        if (weight == null || weight == 0 || value == null) return 0.001;
        return (double) value / weight;
    }

    @Override
    public List<String> getAllElements() {
        return elements;
    }

    @Override
    public List<ParameterDefinition> getParameters() {
        // W uproszczonej wersji zostawiamy puste lub pełne definicje, jak w oryginalnym kodzie
        return List.of(
                new ParameterDefinition("items", "Przedmioty", ParameterType.LIST, elements, null, null, "Lista przedmiotów do wyboru", true),
                new ParameterDefinition("weights", "Wagi", ParameterType.MAP, weights, null, null, "Mapa wag przedmiotów", true),
                new ParameterDefinition("values", "Wartości", ParameterType.MAP, values, null, null, "Mapa wartości przedmiotów", true),
                new ParameterDefinition("capacity", "Pojemność", ParameterType.INTEGER, capacity, 1, 100000, "Pojemność plecaka", true)
        );
    }

    @Override
    public String getPheromoneKey(String from, String to) {
        return (from != null ? from : "START") + "->" + to;
    }
}