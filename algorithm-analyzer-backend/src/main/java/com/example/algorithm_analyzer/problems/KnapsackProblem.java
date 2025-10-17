package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component("knapsackProblem")
public class KnapsackProblem extends AbstractProblem implements Problem {

    private Map<String, Integer> weights = new HashMap<>();
    private Map<String, Integer> values = new HashMap<>();
    private List<String> elements = new ArrayList<>();
    private int capacity;

    @Override
    public String getName() {
        return "Knapsack Problem";
    }

    @Override
    public String getDescription() {
        return "Problem plecakowy (0-1 Knapsack).";
    }

    @Override
    public boolean isMaximization() {
        return true;
    }

    @Override
    public void initialize(Map<String, Object> parameters) {
        this.elements = convertToStringList(getParameter(parameters, "items", List.of()));
        this.weights = convertToIntegerMap(getParameter(parameters, "weights", Map.of()));
        this.values = convertToIntegerMap(getParameter(parameters, "values", Map.of()));
        this.capacity = getParameter(parameters, "capacity", 0);
        this.initialized = true;
    }

    @Override
    public List<String> convertPathToSolution(List<String> path) {
        return path.stream().distinct().collect(Collectors.toList());
    }

    @Override
    public double evaluateSolution(List<String> solution) {
        checkInitialized();
        int totalValue = 0;
        for (String item : solution) {
            totalValue += values.getOrDefault(item, 0);
        }
        return totalValue;
    }

    @Override
    public boolean isValidSolution(List<String> solution) {
        int totalWeight = 0;
        for (String item : solution) {
            totalWeight += getWeight(item);
        }
        return totalWeight <= capacity;
    }

    @Override
    public List<String> getPossibleNextElements(String current, List<String> alreadySelectedPath) {
        int currentWeight = alreadySelectedPath.stream().mapToInt(this::getWeight).sum();
        return elements.stream()
                .filter(item -> !alreadySelectedPath.contains(item))
                .filter(item -> currentWeight + getWeight(item) <= capacity)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isSolutionComplete(List<String> path) {
        return getPossibleNextElements(null, path).isEmpty();
    }

    @Override
    public String getStartElement() {
        return null; // Brak ustalonego elementu startowego
    }

    public int getWeight(String item) {
        return weights.getOrDefault(item, 0);
    }

    @Override
    public double getHeuristicValue(String current, String next) {
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
        return List.of(); // Definicje parametrów są teraz w kontrolerze instancji
    }

    @Override
    public String getPheromoneKey(String from, String to) {
        return (from != null ? from : "START") + "->" + to;
    }

    // --- Metody dla Symulowanego Wyżarzania ---

    @Override
    public List<String> generateRandomSolution() {
        checkInitialized();
        List<String> solution = new ArrayList<>();
        int currentWeight = 0;
        Random random = new Random();
        List<String> shuffledElements = new ArrayList<>(this.elements);
        Collections.shuffle(shuffledElements);

        for (String item : shuffledElements) {
            int itemWeight = getWeight(item);
            // Z 50% szansą próbujemy dodać przedmiot, jeśli się zmieści
            if (random.nextBoolean() && currentWeight + itemWeight <= capacity) {
                solution.add(item);
                currentWeight += itemWeight;
            }
        }
        return solution;
    }

    @Override
    public List<String> generateNeighborSolution(List<String> currentSolution) {
        checkInitialized();
        List<String> neighbor = new ArrayList<>(currentSolution);
        Random random = new Random();
        if (elements.isEmpty()) {
            return neighbor;
        }

        // Prosta mutacja: losowo spróbuj dodać lub usunąć jeden przedmiot
        String randomItem = elements.get(random.nextInt(elements.size()));

        if (neighbor.contains(randomItem)) {
            // Jeśli przedmiot jest w plecaku, usuwamy go
            neighbor.remove(randomItem);
        } else {
            // Jeśli go nie ma, dodajemy go (isValidSolution sprawdzi później pojemność)
            neighbor.add(randomItem);
        }
        return neighbor;
    }
}