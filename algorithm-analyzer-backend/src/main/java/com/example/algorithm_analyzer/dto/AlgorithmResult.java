package com.example.algorithm_analyzer.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AlgorithmResult {

    private boolean success;
    private String errorMessage;
    private String algorithmName;
    private String problemName;
    private List<String> bestSolution;
    private Double bestScore;
    private long executionDurationMs;
    private List<Object> iterationResults;

    // Etykiety dla metryk, które zmieniają się w każdej iteracji
    private Map<String, String> specificMetricLabels;

    private Map<String, FinalMetricData> finalMetrics;

    private List<String> nodes;


    public void setBestSolution(List<String> bestSolution, double bestScore) {
        this.bestSolution = bestSolution;
        this.bestScore = bestScore;
    }

    public void setError(String message) {
        this.success = false;
        this.errorMessage = message;
    }
}

