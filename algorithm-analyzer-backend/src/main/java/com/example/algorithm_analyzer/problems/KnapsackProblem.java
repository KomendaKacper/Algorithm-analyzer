package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom; // NOWY IMPORT
import java.util.stream.Collectors;

@Component("knapsackProblem")
public class KnapsackProblem extends AbstractProblem {

    private Map<String, Integer> weights = new HashMap<>();
    private Map<String, Integer> values = new HashMap<>();
    private List<String> elements = new ArrayList<>();
    private int capacity;

    // ... (istniejące metody bez zmian) ...
    @Override
    public String getName() { return "Knapsack Problem"; }
    @Override
    public String getDescription() { return "Problem plecakowy (0-1 Knapsack)."; }
    @Override
    public boolean isMaximization() { return true; }
    @Override
    public void initialize(Map<String, Object> parameters) {
        this.elements = convertToStringList(getParameter(parameters, "items", List.of()));
        this.weights = convertToIntegerMap(getParameter(parameters, "weights", Map.of()));
        this.values = convertToIntegerMap(getParameter(parameters, "values", Map.of()));
        this.capacity = getParameter(parameters, "capacity", 0);
        this.initialized = true;
    }
    @Override
    public List<String> convertPathToSolution(List<String> path) { return path.stream().distinct().collect(Collectors.toList()); }
    @Override
    public double evaluateSolution(List<String> solution) {
        checkInitialized();
        return solution.stream().mapToInt(item -> values.getOrDefault(item, 0)).sum();
    }
    @Override
    public boolean isValidSolution(List<String> solution) {
        return solution.stream().mapToInt(this::getWeight).sum() <= capacity;
    }
    @Override
    public List<String> getPossibleNextElements(String current, List<String> path) {
        int currentWeight = path.stream().mapToInt(this::getWeight).sum();
        return elements.stream()
                .filter(item -> !path.contains(item) && currentWeight + getWeight(item) <= capacity)
                .collect(Collectors.toList());
    }
    @Override
    public boolean isSolutionComplete(List<String> path) { return getPossibleNextElements(null, path).isEmpty(); }
    @Override
    public String getStartElement() { return null; }
    public int getWeight(String item) { return weights.getOrDefault(item, 0); }
    @Override
    public double getHeuristicValue(String current, String next) {
        Integer weight = weights.get(next);
        Integer value = values.get(next);
        if (weight == null || weight == 0 || value == null) return 0.001;
        return (double) value / weight;
    }
    @Override
    public List<String> getAllElements() { return elements; }

    @Override
    public Map<String, Object> getProblemData() {
        return Map.of();
    }

    @Override
    public List<ParameterDefinition> getParameters() { return List.of(); }


    @Override
    public List<String> generateRandomSolution() {
        checkInitialized();
        List<String> solution = new ArrayList<>();
        int currentWeight = 0;
        // --- ZMIANA: Używamy lepszego generatora liczb losowych ---
        Random random = ThreadLocalRandom.current();
        List<String> shuffledElements = new ArrayList<>(this.elements);
        Collections.shuffle(shuffledElements, random);
        for (String item : shuffledElements) {
            if (random.nextBoolean() && currentWeight + getWeight(item) <= capacity) {
                solution.add(item);
                currentWeight += getWeight(item);
            }
        }
        return solution;
    }

    @Override
    public List<String> generateNeighborSolution(List<String> currentSolution) {
        checkInitialized();
        List<String> neighbor = new ArrayList<>(currentSolution);
        if (elements.isEmpty()) return neighbor;
        // --- ZMIANA: Używamy lepszego generatora liczb losowych ---
        String randomItem = elements.get(ThreadLocalRandom.current().nextInt(elements.size()));
        if (neighbor.contains(randomItem)) {
            neighbor.remove(randomItem);
        } else {
            neighbor.add(randomItem);
        }
        return neighbor;
    }
}

