package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.algorithms.ant.AntColonyOptimizationAlgorithm;
import com.example.algorithm_analyzer.dto.AlgorithmInfo;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.problems.Problem;
import com.example.algorithm_analyzer.services.AlgorithmService;
import com.example.algorithm_analyzer.services.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/algorithms")
@RequiredArgsConstructor
public class AlgorithmController {

    private final ProblemService problemService; // serwis do pobierania instancji problemów
    private final AlgorithmService algorithmService;

    private final AntColonyOptimizationAlgorithm aco;

    @GetMapping
    public ResponseEntity<List<AlgorithmInfo>> getAllAlgorithms() {
        return ResponseEntity.ok(algorithmService.getAllAlgorithms());
    }

    /**
     * Wywołanie ACO dla dowolnego problemu
     */
    @PostMapping("/aco/{problemName}/execute")
    public ResponseEntity<AlgorithmResult> executeAco(
            @PathVariable String problemName,
            @RequestBody Map<String, Object> parameters
    ) {
        try {
            Problem problem = problemService.getProblemByName(problemName);
            if (problem == null) {
                return ResponseEntity.badRequest()
                        .body(buildErrorResult("Nieznany problem: " + problemName));
            }

            // Parametry ACO
            Map<String, Object> parsedParameters = parseParameters(parameters);

            AlgorithmResult result = aco.execute(problem, parsedParameters);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(buildErrorResult("Błąd podczas uruchamiania ACO: " + e.getMessage()));
        }
    }

    // ===============================
    // Parsowanie parametrów wejściowych
    // ===============================
    private Map<String, Object> parseParameters(Map<String, Object> parameters) {
        Map<String, Object> parsed = new HashMap<>();
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            Object value = entry.getValue();
            String key = entry.getKey();

            if ("antCount".equals(key) || "iterations".equals(key)) {
                parsed.put(key, value instanceof Number ? ((Number) value).intValue() : Integer.parseInt(value.toString()));
            } else if ("alpha".equals(key) || "beta".equals(key) || "evaporationRate".equals(key) || "pheromoneDeposit".equals(key) || "elitistWeight".equals(key)) {
                parsed.put(key, value instanceof Number ? ((Number) value).doubleValue() : Double.parseDouble(value.toString()));
            } else {
                parsed.put(key, value);
            }
        }
        return parsed;
    }

    // ===============================
    // Budowanie wyniku błędu
    // ===============================
    private AlgorithmResult buildErrorResult(String message) {
        AlgorithmResult result = new AlgorithmResult();
        result.setSuccess(false);
        result.setErrorMessage(message);
        return result;
    }
}
