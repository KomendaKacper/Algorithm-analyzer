package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

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
    @SuppressWarnings("unchecked")
    public void initialize(Map<String, Object> parameters) {
        log.info("Rozpoczynam inicjalizację TravelingSalesmanProblem...");
        try {
            this.cities = convertToStringList(getParameter(parameters, "cities", new ArrayList<>()));
            Object distancesObj = getParameter(parameters, "distances", new HashMap<>());

            if (!(distancesObj instanceof Map)) throw new IllegalArgumentException("Parametr 'distances' musi być mapą.");

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

            // Logika: Pierwsze miasto na liście jest zawsze miastem startowym dla każdego algorytmu.
            log.info("Punkt startowy ustalony na: {}", cities.get(0));

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
        // Dodaj powrót do początku
        totalDistance += getDistance(solution.get(solution.size() - 1), solution.get(0));
        return totalDistance;
    }

    @Override
    public boolean isValidSolution(List<String> solution) {
        checkInitialized();
        // Rozwiązanie jest poprawne, jeśli zawiera wszystkie miasta i zaczyna się od ustalonego startu
        return solution != null
                && solution.size() == cities.size()
                && new HashSet<>(solution).size() == cities.size()
                && solution.get(0).equals(cities.get(0)); // WAŻNE: Weryfikacja startu
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
        // Zawsze zwracamy pierwsze miasto z listy (indeks 0)
        return cities.isEmpty() ? null : cities.get(0);
    }

    @Override
    public List<String> getAllElements() { return new ArrayList<>(cities); }

    @Override
    public List<ParameterDefinition> getParameters() { return List.of(); }

    @Override
    public Map<String, Object> getProblemData() { return Map.of("distances", this.distances); }

    // --- KLUCZOWE ZMIANY DLA ALGORYTMÓW SA I GENETYCZNYCH ---

    @Override
    public List<String> generateRandomSolution() {
        checkInitialized();
        List<String> solution = new ArrayList<>(cities);

        // Zabezpieczenie: jeśli mamy mniej niż 2 miasta, nie ma co tasować
        if (solution.size() < 2) return solution;

        // WAŻNE: Tasujemy tylko podlistę od indeksu 1 do końca.
        // Indeks 0 (Start) pozostaje nienaruszony.
        Collections.shuffle(solution.subList(1, solution.size()), ThreadLocalRandom.current());

        log.debug("Wygenerowano losowe rozwiązanie ze stałym startem: {}", solution);
        return solution;
    }

    @Override
    public List<String> generateNeighborSolution(List<String> currentSolution) {
        // Dla SA generowanie sąsiada to mutacja, która NIE MOŻE ruszać startu
        return mutate(currentSolution);
    }

    public List<String> mutate(List<String> solution) {
        checkInitialized();
        List<String> mutated = new ArrayList<>(solution);
        int size = mutated.size();
        if (size < 3) return mutated; // Zbyt mało elementów, by zamieniać cokolwiek poza startem

        Random rand = ThreadLocalRandom.current();

        // WAŻNE: Losujemy indeksy z zakresu [1, size).
        // Indeks 0 jest wykluczony z losowania.
        int i = rand.nextInt(size - 1) + 1;
        int j = rand.nextInt(size - 1) + 1;

        while (i == j) {
            j = rand.nextInt(size - 1) + 1;
        }

        if (i > j) {
            int temp = i; i = j; j = temp;
        }

        // Standardowy 2-opt swap, ale bezpieczny dla indeksu 0
        while (i < j) {
            Collections.swap(mutated, i, j);
            i++;
            j--;
        }
        return mutated;
    }
}