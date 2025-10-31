package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom; // NOWY IMPORT

@Component("travelingSalesmanProblem")
@Slf4j
public class TravelingSalesmanProblem extends AbstractProblem {

    private List<String> cities = new ArrayList<>();
    private Map<String, Map<String, Double>> distances = new HashMap<>();

    // ... (istniejące metody initialize, evaluateSolution, etc. bez zmian) ...
    @Override
    public String getName() { return "Traveling Salesman Problem (TSP)"; }
    @Override
    public String getDescription() { return "Problem komiwojażera..."; }
    @Override
    public boolean isMaximization() { return false; }
    @Override
    @SuppressWarnings("unchecked")
    public void initialize(Map<String, Object> parameters) {
        log.info("Rozpoczynam inicjalizację TravelingSalesmanProblem...");
        try {
            this.cities = convertToStringList(getParameter(parameters, "cities", new ArrayList<>()));
            Object distancesObj = getParameter(parameters, "distances", new HashMap<>());
            if (!(distancesObj instanceof Map)) throw new IllegalArgumentException("Parametr 'distances' musi być mapą (obiektem JSON).");
            this.distances = new HashMap<>();
            ((Map<?, ?>) distancesObj).forEach((fromCity, toMapObj) -> {
                if (fromCity != null && toMapObj instanceof Map) {
                    this.distances.put(fromCity.toString(), convertToDoubleMap((Map<?, ?>) toMapObj));
                }
            });
            if (this.cities.isEmpty() || this.distances.isEmpty()) {
                this.initialized = false; return;
            }
            this.initialized = true;
            log.info("Inicjalizacja TSP zakończona pomyślnie. Załadowano {} miast.", this.cities.size());
        } catch (Exception e) {
            log.error("Krytyczny błąd podczas inicjalizacji TSP: {}", e.getMessage(), e);
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
        return solution != null && new HashSet<>(solution).size() == cities.size() && solution.size() == cities.size();
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
    public boolean isSolutionComplete(List<String> path) { return path != null && path.size() == cities.size(); }
    @Override
    public double getHeuristicValue(String from, String to) {
        double distance = getDistance(from, to);
        return (distance <= 0) ? 0.0001 : 1.0 / distance;
    }
    private double getDistance(String from, String to) { return distances.getOrDefault(from, Collections.emptyMap()).getOrDefault(to, Double.MAX_VALUE); }
    @Override
    public String getStartElement() { return cities.isEmpty() ? null : cities.get(0); }
    @Override
    public List<String> getAllElements() { return new ArrayList<>(cities); }
    @Override
    public List<ParameterDefinition> getParameters() { return List.of(); }
    @Override
    public Map<String, Object> getProblemData() { return Map.of("distances", this.distances); }


    @Override
    public List<String> generateRandomSolution() {
        checkInitialized();
        List<String> randomSolution = new ArrayList<>(cities);
        // --- ZMIANA: Używamy lepszego generatora liczb losowych ---
        Collections.shuffle(randomSolution, ThreadLocalRandom.current());
        return randomSolution;
    }

    @Override
    public List<String> generateNeighborSolution(List<String> currentSolution) {
        // Dla TSP, generowanie sąsiada to to samo co mutacja
        return mutate(currentSolution);
    }

    @Override
    public List<String> crossover(List<String> parent1, List<String> parent2) {
        checkInitialized();
        // --- ZMIANA: Używamy lepszego generatora liczb losowych ---
        Random rand = ThreadLocalRandom.current();
        int size = parent1.size();

        int start = rand.nextInt(size);
        int end = rand.nextInt(size);

        if (start > end) {
            int temp = start;
            start = end;
            end = temp;
        }

        List<String> child = new ArrayList<>(Collections.nCopies(size, null));
        Set<String> childSubset = new HashSet<>();

        for (int i = start; i <= end; i++) {
            child.set(i, parent1.get(i));
            childSubset.add(parent1.get(i));
        }

        int childIndex = (end + 1) % size;
        for (int i = 0; i < size; i++) {
            int parentIndex = (end + 1 + i) % size;
            String city = parent2.get(parentIndex);
            if (!childSubset.contains(city)) {
                child.set(childIndex, city);
                childIndex = (childIndex + 1) % size;
            }
        }
        return child;
    }

    @Override
    public List<String> mutate(List<String> solution) {
        checkInitialized();
        List<String> mutated = new ArrayList<>(solution);
        int size = mutated.size();
        if (size < 2) return mutated;

        // --- ZMIANA: Używamy lepszego generatora liczb losowych ---
        Random rand = ThreadLocalRandom.current();
        int i = rand.nextInt(size);
        int j = rand.nextInt(size);
        while (i == j) {
            j = rand.nextInt(size);
        }

        Collections.swap(mutated, i, j);
        return mutated;
    }
}

