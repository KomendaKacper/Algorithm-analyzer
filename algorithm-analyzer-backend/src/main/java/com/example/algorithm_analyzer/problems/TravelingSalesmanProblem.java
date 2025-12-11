package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dtos.ParameterDefinition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component("travelingSalesmanProblem")
@Slf4j
public class TravelingSalesmanProblem extends AbstractProblem {

    private List<String> cities = new ArrayList<>();
    private Map<String, Map<String, Double>> distances = new HashMap<>();

    @Override
    public String getName() { return "Traveling Salesman Problem (TSP)"; }

    @Override
    public String getDescription() { return "Problem komiwojażera z ustalonym punktem startowym."; }

    @Override
    public boolean isMaximization() { return false; }

    @Override
    public void initialize(Map<String, Object> parameters) {
        log.info("Initializing TravelingSalesmanProblem...");
        try {
            this.cities = convertToStringList(getParameter(parameters, "cities", new ArrayList<>()));
            Object distancesObj = getParameter(parameters, "distances", new HashMap<>());

            if (!(distancesObj instanceof Map)) throw new IllegalArgumentException("Parameter 'distances' must be a map.");

            this.distances = new HashMap<>();
            ((Map<?, ?>) distancesObj).forEach((fromCity, toMapObj) -> {
                if (fromCity != null && toMapObj instanceof Map) {
                    this.distances.put(fromCity.toString(), convertToDoubleMap((Map<?, ?>) toMapObj));
                }
            });

            if (this.cities.isEmpty() || this.distances.isEmpty()) {
                this.initialized = false;
                return;
            }

            log.info("Start point set to: {}", cities.get(0));

            this.initialized = true;
            log.info("TSP initialization successful. Loaded {} cities.", this.cities.size());
        } catch (Exception e) {
            log.error("Critical error during TSP initialization: {}", e.getMessage(), e);
            this.initialized = false;
        }
    }

    @Override
    public double evaluateSolution(List<String> solution) {
        checkInitialized();
        if (solution == null || solution.size() < 2) return Double.MAX_VALUE;
        double totalDistance = 0.0;
        for (int i = 0; i < solution.size() - 1; i++) {
            totalDistance += getDistance(solution.get(i), solution.get(i + 1));
        }
        totalDistance += getDistance(solution.get(solution.size() - 1), solution.get(0));
        return totalDistance;
    }

    @Override
    public boolean isValidSolution(List<String> solution) {
        checkInitialized();
        return solution != null
                && solution.size() == cities.size()
                && new HashSet<>(solution).size() == cities.size()
                && solution.get(0).equals(cities.get(0));
    }

    @Override
    public List<String> convertPathToSolution(List<String> path) { return path; }

    @Override
    public List<String> getPossibleNextElements(String current, List<String> visited) {
        checkInitialized();
        List<String> remainingCities = new ArrayList<>(cities);
        remainingCities.removeAll(visited);
        return remainingCities;
    }

    @Override
    public boolean isSolutionComplete(List<String> path) {
        return path != null && path.size() == cities.size();
    }

    @Override
    public double getHeuristicValue(String from, String to) {
        double distance = getDistance(from, to);
        return (distance <= 0) ? 0.0001 : 1.0 / distance;
    }

    private double getDistance(String from, String to) {
        return distances.getOrDefault(from, Collections.emptyMap())
                .getOrDefault(to, Double.MAX_VALUE);
    }

    @Override
    public String getStartElement() {
        return cities.isEmpty() ? null : cities.get(0);
    }

    @Override
    public List<String> getAllElements() { return new ArrayList<>(cities); }

    @Override
    public List<ParameterDefinition> getParameters() { return List.of(); }

    @Override
    public Map<String, Object> getProblemData() { return Map.of("distances", this.distances); }

    @Override
    public List<String> generateRandomSolution() {
        checkInitialized();
        List<String> solution = new ArrayList<>(cities);

        if (solution.size() < 2) return solution;

        Collections.shuffle(solution.subList(1, solution.size()), ThreadLocalRandom.current());

        log.debug("Generated random solution with fixed start: {}", solution);
        return solution;
    }

    @Override
    public List<String> generateNeighborSolution(List<String> currentSolution) {
        return mutate(currentSolution);
    }

    public List<String> mutate(List<String> solution) {
        checkInitialized();
        List<String> mutated = new ArrayList<>(solution);
        int size = mutated.size();
        if (size < 3) return mutated;

        Random rand = ThreadLocalRandom.current();

        int i = rand.nextInt(size - 1) + 1;
        int j = rand.nextInt(size - 1) + 1;

        while (i == j) {
            j = rand.nextInt(size - 1) + 1;
        }

        if (i > j) {
            int temp = i; i = j; j = temp;
        }

        while (i < j) {
            Collections.swap(mutated, i, j);
            i++;
            j--;
        }
        return mutated;
    }
}