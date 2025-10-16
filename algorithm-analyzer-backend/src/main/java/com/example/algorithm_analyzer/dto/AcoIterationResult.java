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
    private List<String> bestSolution;        // uniwersalne rozwiązanie
    private Double bestScore;                  // najlepszy wynik funkcji celu
    private Double worstScore;                 // najgorszy wynik
    private Double averageScore;               // średni wynik
    private Double executionDurationMs;
    private Integer constraintViolations;
    private Double diversity;
    private Integer stagnation;

    // 🔹 Pola dla śledzenia feromonów
    private Map<String, Double> pheromoneSnapshot;  // pełny rozkład feromonów w tej iteracji
    private Map<String, Object> pheromoneStats;     // statystyki: min, max, average, total

    // Konstruktor bez feromonów (dla kompatybilności wstecznej)
    public AcoIterationResult(Integer iteration, List<String> bestSolution, Double bestScore,
                              Double worstScore, Double averageScore, Double executionDurationMs,
                              Integer constraintViolations, Double diversity, Integer stagnation) {
        this.iteration = iteration;
        this.bestSolution = bestSolution;
        this.bestScore = bestScore;
        this.worstScore = worstScore;
        this.averageScore = averageScore;
        this.executionDurationMs = executionDurationMs;
        this.constraintViolations = constraintViolations;
        this.diversity = diversity;
        this.stagnation = stagnation;
    }
}
