package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import java.util.List;
import java.util.Map;

// Klasa bazowa dla uniwersalnego Problem (Wzorzec Strategia)
public interface Problem {

    String getName();
    String getDescription();

    void initialize(Map<String, Object> parameters);

    /**
     * Główna funkcja oceniająca rozwiązanie.
     * @param solution ścieżka (path) wygenerowana przez algorytm.
     * @return Wartość funkcji celu (fitness).
     */
    double evaluateSolution(List<String> solution);

    /**
     * Sprawdza, czy dane rozwiązanie spełnia ograniczenia problemu.
     */
    boolean isValidSolution(List<String> solution);

    /**
     * Metoda kluczowa dla ACO. Konwertuje ścieżkę (sequence of choices) na właściwe rozwiązanie.
     * Dla TSP: ścieżka to rozwiązanie. Dla Knapsack: ścieżka to zbiór wybranych przedmiotów.
     * @param path lista kolejnych wyborów (węzłów) dokonanych przez mrówkę.
     * @return Ostateczne, przetworzone rozwiązanie (np. lista unikalnych przedmiotów, trasa).
     */
    List<String> convertPathToSolution(List<String> path);


    // Metody wymagane przez ACO (logika "ruchu")

    List<String> getAllElements();
    String getStartElement();
    double getHeuristicValue(String from, String to);
    List<String> getPossibleNextElements(String current, List<String> path);
    boolean isSolutionComplete(List<String> path);
    String getPheromoneKey(String from, String to);
    List<ParameterDefinition> getParameters();
    boolean isMaximization();
}