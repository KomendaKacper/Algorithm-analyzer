package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import java.util.List;
import java.util.Map;

public interface Problem {
    // === Metody Podstawowe ===
    String getName();
    String getDescription();
    boolean isMaximization();
    void initialize(Map<String, Object> parameters);
    double evaluateSolution(List<String> solution);
    boolean isValidSolution(List<String> solution);
    List<String> getAllElements();
    Map<String, Object> getProblemData();

    // === Metody dla Algorytmów Konstrukcyjnych (np. ACO) ===
    List<String> getPossibleNextElements(String current, List<String> visited);
    boolean isSolutionComplete(List<String> path);
    double getHeuristicValue(String from, String to);
    String getStartElement();
    String getPheromoneKey(String from, String to);
    List<String> convertPathToSolution(List<String> path);

    // === Metody dla Algorytmów Przeszukiwania Lokalnego (np. SA, TS) ===
    List<String> generateRandomSolution();
    List<String> generateNeighborSolution(List<String> currentSolution);

    // === NOWE METODY: Dla Algorytmów Ewolucyjnych (np. Genetycznego) ===
    List<String> crossover(List<String> parent1, List<String> parent2);
    List<String> mutate(List<String> solution);

    // === Metody Pomocnicze ===
    List<ParameterDefinition> getParameters();
}

