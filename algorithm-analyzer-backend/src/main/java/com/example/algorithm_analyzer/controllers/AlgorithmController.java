package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AlgorithmInfo;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.problems.Problem;
import com.example.algorithm_analyzer.services.ProblemService;
import com.example.algorithm_analyzer.services.AlgorithmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/algorithms")
@RequiredArgsConstructor
@Slf4j
public class AlgorithmController {

    private final ProblemService problemService;
    private final AlgorithmService algorithmService;

    @GetMapping
    public ResponseEntity<List<AlgorithmInfo>> getAllAlgorithms() {
        return ResponseEntity.ok(algorithmService.getAllAlgorithmsInfo());
    }

    @PostMapping("/{algorithmName}/problems/{problemName}/execute")
    public ResponseEntity<AlgorithmResult> executeAlgorithm(
            @PathVariable String algorithmName,
            @PathVariable String problemName,
            @RequestBody ExecutionRequest request
    ) {
        log.info("Received execution request for algorithm: '{}' on problem: '{}'", algorithmName, problemName);

        try {
            // --- POPRAWKA: Użyj nowego serwisu do pobierania problemów ---
            Problem problem = problemService.getProblemByName(problemName);

            Algorithm algorithm = algorithmService.getAlgorithmByName(algorithmName);

            Map<String, Object> problemParams = (request.getProblemParameters() != null)
                    ? request.getProblemParameters() : Collections.emptyMap();
            Map<String, Object> algorithmParams = (request.getAlgorithmParameters() != null)
                    ? request.getAlgorithmParameters() : Collections.emptyMap();

            log.debug("Problem parameters passed to initialize: {}", problemParams);
            log.debug("Algorithm parameters passed to execute: {}", algorithmParams);

            AlgorithmResult result = algorithm.execute(problem, problemParams, algorithmParams);

            return ResponseEntity.ok(result);

        } catch (NoSuchElementException e) {
            log.warn("Resource not found: {}", e.getMessage());
            AlgorithmResult errorResult = new AlgorithmResult();
            errorResult.setError(e.getMessage());
            return ResponseEntity.status(404).body(errorResult);
        } catch (Exception e) {
            log.error("Critical error during algorithm execution", e);
            AlgorithmResult errorResult = new AlgorithmResult();
            errorResult.setError("Server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResult);
        }
    }

    @lombok.Data
    public static class ExecutionRequest {
        private Map<String, Object> algorithmParameters;
        private Map<String, Object> problemParameters;
    }
}