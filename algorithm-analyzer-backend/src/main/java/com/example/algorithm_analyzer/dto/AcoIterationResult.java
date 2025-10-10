package com.example.algorithm_analyzer.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@Getter
@Setter
public class AcoIterationResult {
    private int iteration;
    private List<String> bestPath;
    private double bestDistance;
    private double worstDistance;
    private double averageDistance;
    private double executionDurationMs;
    private int constraintViolations;   // liczba niedopuszczalnych rozwiązań
    private double diversity;           // średnia odległość między rozwiązaniami
    private int stagnation;             // liczba iteracji bez poprawy najlepszego wyniku


    public AcoIterationResult(int iteration, List<String> bestPath, double bestDistance,
                              double worstDistance, double averageDistance, double executionDurationMs,
                              int constraintViolations, double diversity, int stagnation) {
        this.iteration = iteration;
        this.bestPath = bestPath;
        this.bestDistance = bestDistance;
        this.worstDistance = worstDistance;
        this.averageDistance = averageDistance;
        this.executionDurationMs = executionDurationMs;
        this.constraintViolations = constraintViolations;
        this.diversity = diversity;
        this.stagnation = stagnation;
    }
}
