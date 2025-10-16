package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class TravelingSalesmanProblem implements Problem {

    private List<String> elements;                     // miasta
    private Map<String, Map<String, Double>> distances; // macierz odległości

    @Override
    public String getName() {
        return "TSP";
    }

    @Override
    public String getDescription() {
        return "Problem komiwojażera - minimalizacja długości trasy odwiedzającej wszystkie miasta";
    }

    @Override
    public List<ParameterDefinition> getParameters() {
        return List.of(
                new ParameterDefinition(
                        "cities",
                        "Lista miast",
                        ParameterType.LIST,
                        null, null, null,
                        "Podaj nazwy miast, np. [\"Warszawa\", \"Kraków\", \"Gdańsk\"]",
                        true
                ),
                new ParameterDefinition(
                        "distances",
                        "Macierz odległości",
                        ParameterType.MAP,
                        null, null, null,
                        "Podaj odległości między miastami w formacie JSON, np. {\"Warszawa\": {\"Kraków\": 300, \"Gdańsk\": 350}, ...}",
                        true
                )
        );
    }

    @Override
    public void initialize(Map<String, Object> parameters) {
        // Pobranie listy miast
        elements = (List<String>) parameters.get("cities");

        // Pobranie macierzy odległości
        distances = (Map<String, Map<String, Double>>) parameters.get("distances");

        // Walidacja: wszystkie miasta muszą mieć wpisy odległości do pozostałych
        for (String city : elements) {
            if (!distances.containsKey(city)) {
                throw new IllegalArgumentException("Brak odległości dla miasta: " + city);
            }
            for (String other : elements) {
                if (!city.equals(other) && !distances.get(city).containsKey(other)) {
                    throw new IllegalArgumentException(
                            "Brak odległości z " + city + " do " + other
                    );
                }
            }
        }
    }

    @Override
    public List<String> getAllElements() {
        return elements != null ? elements : Collections.emptyList();
    }

    @Override
    public String getStartElement() {
        return elements != null && !elements.isEmpty() ? elements.get(0) : null;
    }

    @Override
    public boolean isSolutionComplete(List<String> solution) {
        return solution.size() == elements.size();
    }

    @Override
    public List<String> getPossibleNextElements(String current, List<String> partialSolution) {
        List<String> remaining = new ArrayList<>(elements);
        remaining.removeAll(partialSolution);
        return remaining;
    }

    @Override
    public double evaluateSolution(List<String> solution) {
        double sum = 0;
        for (int i = 0; i < solution.size() - 1; i++) {
            String from = solution.get(i);
            String to = solution.get(i + 1);
            sum += distances.get(from).get(to);
        }
        return sum;
    }

    @Override
    public boolean isValidSolution(List<String> solution) {
        return solution.size() <= elements.size();
    }

    @Override
    public String getPheromoneKey(String from, String to) {
        return from + "->" + to;
    }

    @Override
    public double getHeuristicValue(String from, String to) {
        return 1.0 / distances.get(from).get(to); // odwrotność odległości
    }
}
