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
    private double executionDurationMs;

    public AcoIterationResult(int iteration, List<String> bestPath, double bestDistance, double executionDurationMs) {
        this.iteration = iteration;
        this.bestPath = bestPath;
        this.bestDistance = bestDistance;
        this.executionDurationMs = executionDurationMs;
    }
}
