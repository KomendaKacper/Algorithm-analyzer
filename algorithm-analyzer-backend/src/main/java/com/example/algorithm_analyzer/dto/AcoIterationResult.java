package com.example.algorithm_analyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcoIterationResult {
    private Integer iteration;
    private List<String> bestPath;
    private Double bestDistance;
    private Double worstDistance;
    private Double averageDistance;
    private Double executionDurationMs;
    private Integer constraintViolations;
    private Double diversity;
    private Integer stagnation;

    // 🔹 Nowe pola dla śledzenia feromonów
    private Map<String, Double> pheromoneSnapshot;  // pełny rozkład feromonów w tej iteracji
    private Map<String, Object> pheromoneStats;     // statystyki: min, max, average, total

    // Konstruktor bez feromonów (dla kompatybilności wstecznej)
    public AcoIterationResult(Integer iteration, List<String> bestPath, Double bestDistance,
                              Double worstDistance, Double averageDistance, Double executionDurationMs,
                              Integer constraintViolations, Double diversity, Integer stagnation) {
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