package com.example.algorithm_analyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlgorithmResult {

    private boolean success = true;
    private String errorMessage;

    private String algorithmName;                     // nazwa algorytmu
    private LocalDateTime executionTime;             // czas rozpoczęcia wykonania

    private List<AcoIterationResult> iterationResults;  // lista wyników dla każdej iteracji (jeśli dotyczy)
    private List<String> bestSolution;                  // uniwersalne najlepsze rozwiązanie
    private Double bestScore;                            // uniwersalny najlepszy wynik funkcji celu

    private Double executionDurationMs;                 // całkowity czas wykonania algorytmu
    private Integer totalConstraintViolations;          // suma naruszeń ograniczeń

    private Map<String, Object> results;               // dowolne dodatkowe wyniki, np. parametry końcowe
    private Map<String, Object> statistics;            // dowolne statystyki, np. liczba iteracji, liczba mrówek, itp.

    // =============================
    // Metody pomocnicze do ustawiania wyników
    // =============================

    public void setError(String message) {
        this.success = false;
        this.errorMessage = message;
    }

    public void setBestSolution(List<String> solution, Double score) {
        this.bestSolution = solution;
        this.bestScore = score;
    }

    public void setIterationResults(List<AcoIterationResult> iterationResults) {
        this.iterationResults = iterationResults;
    }

    public void setStatistics(Map<String, Object> statistics) {
        this.statistics = statistics;
    }

    public void setResults(Map<String, Object> results) {
        this.results = results;
    }

    public void setExecutionDuration(double durationMs) {
        this.executionDurationMs = durationMs;
    }

    public void setTotalConstraintViolations(int violations) {
        this.totalConstraintViolations = violations;
    }

    public void setAlgorithmName(String algorithmName) {
        this.algorithmName = algorithmName;
    }

    public void setExecutionTime(LocalDateTime executionTime) {
        this.executionTime = executionTime;
    }

    public void addStatistic(String key, Object value) {
        if (this.statistics != null) {
            this.statistics.put(key, value);
        }
    }

    public void addResult(String key, Object value) {
        if (this.results != null) {
            this.results.put(key, value);
        }
    }
}
