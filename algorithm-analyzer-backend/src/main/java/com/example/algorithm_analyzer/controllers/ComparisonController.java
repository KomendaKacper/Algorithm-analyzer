package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.problems.Problem;
// import com.example.algorithm_analyzer.services.ProblemService; // <-- USUNIĘTE
import com.example.algorithm_analyzer.services.DynamicProblemService; // <-- DODANE
import com.example.algorithm_analyzer.services.DynamicAlgorithmService; // <-- DODANE (z poprzedniej poprawki)
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
@Slf4j
public class ComparisonController {

    // private final ProblemService problemService; // <-- USUNIĘTE
    private final DynamicProblemService dynamicProblemService; // <-- ZASTĄPIONE
    private final DynamicAlgorithmService dynamicAlgorithmService; // <-- ZASTĄPIONE

    @PostMapping("/{problemName}/execute")
    public ResponseEntity<List<AlgorithmResult>> executeComparison(
            @PathVariable String problemName,
            @RequestBody ComparisonRequest request
    ) {
        log.info("Starting comparative analysis for problem: {}", problemName);

        // --- POPRAWKA: Użyj nowego serwisu do pobierania problemów ---
        Problem problem = dynamicProblemService.getProblemByName(problemName);

        List<AlgorithmResult> results = new ArrayList<>();
        Map<String, Integer> nameCounts = new HashMap<>();

        Map<String, Long> totalOccurrences = new HashMap<>();
        for (AlgorithmExecutionRequest algoRequest : request.getAlgorithms()) {
            totalOccurrences.merge(algoRequest.getName(), 1L, Long::sum);
        }

        for (AlgorithmExecutionRequest algoRequest : request.getAlgorithms()) {
            String originalName = algoRequest.getName();
            log.info("Executing algorithm: {}", originalName);

            Algorithm algorithm = dynamicAlgorithmService.getAlgorithmByName(originalName);

            AlgorithmResult result = algorithm.execute(problem, request.getProblemParameters(), algoRequest.getParameters());

            if (totalOccurrences.getOrDefault(originalName, 0L) > 1) {
                int currentCount = nameCounts.getOrDefault(originalName, 0) + 1;
                nameCounts.put(originalName, currentCount);
                String uniqueName = String.format("%s [#%d]", originalName, currentCount);
                result.setAlgorithmName(uniqueName);
            }

            results.add(result);
        }

        log.info("Finished comparative analysis. Returning {} results.", results.size());
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