package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.problems.Problem;
import com.example.algorithm_analyzer.services.AlgorithmService;
import com.example.algorithm_analyzer.services.ProblemService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap; // Potrzebny import
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
@Slf4j
public class ComparisonController {

    private final ProblemService problemService;
    private final AlgorithmService algorithmService;

    @PostMapping("/{problemName}/execute")
    public ResponseEntity<List<AlgorithmResult>> executeComparison(
            @PathVariable String problemName,
            @RequestBody ComparisonRequest request
    ) {
        log.info("Rozpoczynanie analizy porównawczej dla problemu: {}", problemName);

        Problem problem = problemService.getProblemByName(problemName);
        if (problem == null) {
            throw new NoSuchElementException("Nie znaleziono problemu o nazwie: " + problemName);
        }

        List<AlgorithmResult> results = new ArrayList<>();
        // --- KLUCZOWA ZMIANA: Mapa do śledzenia liczby wystąpień każdej nazwy algorytmu ---
        Map<String, Integer> nameCounts = new HashMap<>();

        // Sprawdzamy, które nazwy algorytmów w ogóle się powtarzają w żądaniu
        Map<String, Long> totalOccurrences = new HashMap<>();
        for (AlgorithmExecutionRequest algoRequest : request.getAlgorithms()) {
            totalOccurrences.merge(algoRequest.getName(), 1L, Long::sum);
        }

        for (AlgorithmExecutionRequest algoRequest : request.getAlgorithms()) {
            String originalName = algoRequest.getName();
            log.info("Wykonywanie algorytmu: {}", originalName);

            Algorithm algorithm = algorithmService.getAlgorithmByName(originalName)
                    .orElseThrow(() -> new NoSuchElementException("Nie znaleziono algorytmu: " + originalName));

            // Wykonaj algorytm jak poprzednio
            AlgorithmResult result = algorithm.execute(problem, request.getProblemParameters(), algoRequest.getParameters());

            // --- KLUCZOWA ZMIANA: Tworzenie unikalnej etykiety ---
            // Jeśli dana nazwa występuje więcej niż raz w całym żądaniu...
            if (totalOccurrences.getOrDefault(originalName, 0L) > 1) {
                int currentCount = nameCounts.getOrDefault(originalName, 0) + 1;
                nameCounts.put(originalName, currentCount);
                // ...to stwórz unikalną etykietę, np. "Ant Colony Optimization (ACO) [#1]"
                String uniqueName = String.format("%s [#%d]", originalName, currentCount);
                // i ustaw ją w obiekcie wyniku.
                result.setAlgorithmName(uniqueName);
            }
            // Jeśli nazwa jest unikalna, nic nie zmieniamy - `result.getAlgorithmName()` ma już poprawną wartość.

            results.add(result);
        }

        log.info("Zakończono analizę porównawczą. Zwracam {} wyników.", results.size());
        return ResponseEntity.ok(results);
    }

    @Data
    public static class ComparisonRequest {
        private Map<String, Object> problemParameters;
        private List<AlgorithmExecutionRequest> algorithms;
    }

    @Data
    public static class AlgorithmExecutionRequest {
        private String name;
        private Map<String, Object> parameters;
    }
}