package com.example.algorithm_analyzer.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaIterationResult {
    private final int iteration;
    private final double temperature;
    private final List<String> bestSolution;
    private final double bestScore;
    private final double currentScore;
    private final int acceptedWorseMoves;
    private final double executionDurationMs;
}