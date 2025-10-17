package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import java.util.List;
import java.util.Map;

public interface Problem {
    // ... (istniejące metody: getName, getDescription, isMaximization, etc.)

    String getName();
    String getDescription();
    boolean isMaximization();
    void initialize(Map<String, Object> parameters);
    double evaluateSolution(List<String> solution);
    boolean isValidSolution(List<String> solution);
    List<String> getPossibleNextElements(String current, List<String> visited);
    boolean isSolutionComplete(List<String> path);
    double getHeuristicValue(String from, String to);
    String getStartElement();
    List<String> getAllElements();
    String getPheromoneKey(String from, String to);
    List<ParameterDefinition> getParameters();
    List<String> convertPathToSolution(List<String> path);

    // --- NOWE METODY DLA SYMULOWANEGO WYŻARZANIA ---

    /**
     * Generuje losowe, ale poprawne rozwiązanie startowe.
     * @return Lista elementów tworzących rozwiązanie.
     */
    List<String> generateRandomSolution();

    /**
     * Generuje "sąsiada" danego rozwiązania, czyli lekko zmodyfikowaną wersję.
     * @param currentSolution Aktualne rozwiązanie.
     * @return Nowe, sąsiednie rozwiązanie.
     */
    List<String> generateNeighborSolution(List<String> currentSolution);
}