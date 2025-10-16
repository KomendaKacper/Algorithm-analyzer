package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import java.util.List;
import java.util.Map;

public interface Problem {

    String getName();
    String getDescription();

    /**
     * Inicjalizacja problemu – parametry mogą zawierać np. macierz heurystyki
     */
    void initialize(Map<String, Object> parameters);

    /**
     * Fitness: im mniejsza wartość, tym lepiej
     */
    double evaluateSolution(List<String> solution);

    boolean isValidSolution(List<String> solution);

    /**
     * Heurystyka między elementami
     */
    double getHeuristicValue(String from, String to);

    List<String> getPossibleNextElements(String current, List<String> alreadySelected);

    String getStartElement();

    boolean isSolutionComplete(List<String> solution);

    List<String> getAllElements();

    String getPheromoneKey(String from, String to);

    List<ParameterDefinition> getParameters();
}
