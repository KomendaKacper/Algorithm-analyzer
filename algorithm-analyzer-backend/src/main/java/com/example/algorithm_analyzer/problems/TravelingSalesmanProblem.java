package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Component("travelingSalesmanProblem") // Ważne: nazwa komponentu musi pasować do problemName w JSON
@Slf4j
public class TravelingSalesmanProblem extends AbstractProblem implements Problem {

    private List<String> cities = new ArrayList<>();
    private Map<String, Map<String, Double>> distances = new HashMap<>();

    @Override
    public String getName() {
        return "Traveling Salesman Problem (TSP)";
    }

    @Override
    public String getDescription() {
        return "Problem komiwojażera polegający na znalezieniu najkrótszej trasy, która odwiedza każde miasto dokładnie raz i wraca do miasta startowego.";
    }

    @Override
    public boolean isMaximization() {
        return false; // Zawsze minimalizujemy dystans
    }

    @Override
    @SuppressWarnings("unchecked")
    public void initialize(Map<String, Object> parameters) {
        log.info("Rozpoczynam inicjalizację TravelingSalesmanProblem...");
        try {
            // Bezpieczne pobieranie i rzutowanie parametrów
            this.cities = convertToStringList(getParameter(parameters, "cities", new ArrayList<>()));

            Object distancesObj = getParameter(parameters, "distances", new HashMap<>());
            if (!(distancesObj instanceof Map)) {
                throw new IllegalArgumentException("Parametr 'distances' musi być mapą (obiektem JSON).");
            }

            this.distances = new HashMap<>();
            ((Map<?, ?>) distancesObj).forEach((fromCity, toMapObj) -> {
                if (fromCity != null && toMapObj instanceof Map) {
                    Map<String, Double> innerMap = convertToDoubleMap((Map<?, ?>) toMapObj);
                    this.distances.put(fromCity.toString(), innerMap);
                }
            });

            // Kluczowa walidacja
            if (this.cities.isEmpty()) {
                log.error("Błąd inicjalizacji: Lista 'cities' jest pusta.");
                this.initialized = false;
                return;
            }
            if (this.distances.isEmpty()) {
                log.error("Błąd inicjalizacji: Mapa 'distances' jest pusta.");
                this.initialized = false;
                return;
            }

            this.initialized = true;
            log.info("Inicjalizacja TSP zakończona pomyślnie. Załadowano {} miast.", this.cities.size());

        } catch (ClassCastException e) {
            log.error("Błąd rzutowania typów podczas inicjalizacji. Sprawdź strukturę JSON. Błąd: {}", e.getMessage(), e);
            this.initialized = false;
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
        // Zamknięcie cyklu - powrót do miasta startowego
        totalDistance += getDistance(solution.get(solution.size() - 1), solution.get(0));

        return totalDistance;
    }

    @Override
    public boolean isValidSolution(List<String> solution) {
        checkInitialized();
        if (solution == null) return false;
        // Poprawne rozwiązanie musi zawierać każde miasto dokładnie raz.
        boolean isValid = new HashSet<>(solution).size() == cities.size() && solution.size() == cities.size();
        if (!isValid) {
            log.warn("Wykryto nieprawidłowe rozwiązanie. Oczekiwano {} unikalnych miast, ścieżka zawiera {} elementów ({} unikalnych). Ścieżka: {}",
                    cities.size(), solution.size(), new HashSet<>(solution).size(), solution);
        }
        return isValid;
    }

    @Override
    public List<String> convertPathToSolution(List<String> path) {
        return path;
    }

    @Override
    public List<String> getPossibleNextElements(String current, List<String> visited) {
        checkInitialized();
        List<String> remainingCities = new ArrayList<>(cities);
        remainingCities.removeAll(visited);
        return remainingCities;
    }

    @Override
    public boolean isSolutionComplete(List<String> path) {
        checkInitialized();
        return path != null && path.size() == cities.size();
    }

    @Override
    public double getHeuristicValue(String from, String to) {
        double distance = getDistance(from, to);
        if (distance <= 0 || distance >= Double.MAX_VALUE) {
            return 0.0001;
        }
        return 1.0 / distance;
    }

    private double getDistance(String from, String to) {
        return distances.getOrDefault(from, Collections.emptyMap()).getOrDefault(to, Double.MAX_VALUE);
    }

    @Override
    public String getStartElement() {
        checkInitialized();
        return cities.isEmpty() ? null : cities.get(0);
    }

    @Override
    public List<String> getAllElements() {
        return new ArrayList<>(cities);
    }

    @Override
    public String getPheromoneKey(String from, String to) {
        return (from != null ? from : "START") + "->" + to;
    }

    @Override
    public List<ParameterDefinition> getParameters() {
        return List.of();
    }
}