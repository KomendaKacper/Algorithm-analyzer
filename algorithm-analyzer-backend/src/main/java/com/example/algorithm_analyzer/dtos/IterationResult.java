// src/main/java/com/example/algorithm_analyzer/dto/IterationResult.java
package com.example.algorithm_analyzer.dtos;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class IterationResult {

    // --- METRYKI PODSTAWOWE (wspólne dla wszystkich algorytmów) ---
    private int iteration;
    private double bestScore;
    private List<String> bestSolution;
    private double executionDurationMs;

    // --- NOWE POLE: Rozwiązanie, które jest "aktywne" w tej iteracji ---
    // (Dla SA/TS będzie to 'currentSolution', dla ACO 'bestAntSolution')
    private List<String> currentSolution;

    // --- METRYKI OPCJONALNE (mogą, ale nie muszą istnieć) ---
    private Double currentScore; // np. dla SA
    private Double averageScore; // np. dla algorytmów populacyjnych
    private Double worstScore;   // np. dla algorytmów populacyjnych

    // --- METRYKI SPECYFICZNE DLA ALGORYTMU (klucz do elastyczności!) ---
    // Ta mapa może przechować wszystko: temperaturę, statystyki feromonów,
    // współczynnik mutacji itp.
    private Map<String, Object> specificMetrics;
}