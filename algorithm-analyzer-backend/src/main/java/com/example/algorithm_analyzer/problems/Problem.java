package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dtos.ParameterDefinition;
import java.util.List;
import java.util.Map;

public interface Problem {
    String getName();
    String getDescription();
    boolean isMaximization();
    void initialize(Map<String, Object> parameters);
    double evaluateSolution(List<String> solution);
    boolean isValidSolution(List<String> solution);
    List<String> getAllElements();
    Map<String, Object> getProblemData();

    List<String> getPossibleNextElements(String current, List<String> visited);
    boolean isSolutionComplete(List<String> path);
    double getHeuristicValue(String from, String to);
    String getStartElement();
    String getPheromoneKey(String from, String to);
    List<String> convertPathToSolution(List<String> path);

    List<String> generateRandomSolution();
    List<String> generateNeighborSolution(List<String> currentSolution);

    List<ParameterDefinition> getParameters();
}

