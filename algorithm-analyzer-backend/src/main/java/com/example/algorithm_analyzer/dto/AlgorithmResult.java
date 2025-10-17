package com.example.algorithm_analyzer.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AlgorithmResult {

    private boolean success;
    private String errorMessage;
    private String algorithmName;
    private String problemName; // <-- NOWE POLE
    private List<String> bestSolution;
    private Double bestScore;
    private long executionDurationMs;
    private List<Object> iterationResults;

    public void setBestSolution(List<String> bestSolution, double bestScore) {
        this.bestSolution = bestSolution;
        this.bestScore = bestScore;
    }

    public void setError(String message) {
        this.success = false;
        this.errorMessage = message;
    }
}