package com.example.algorithm_analyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlgorithmResult {
    private String algorithmName;
    private LocalDateTime executionTime;
    private long executionDurationms;
    private boolean success;
    private String errorMessage;
    private Map<String, Object> results;
    private List<String> path;
    private Double pathLength;
    private Map<String, Object> statistics;
}
