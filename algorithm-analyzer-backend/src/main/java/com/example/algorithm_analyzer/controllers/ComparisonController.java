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
        log.debug("Otrzymano problem parameters: {}", request.getProblemParameters());
        log.debug("Otrzymano {} konfiguracji algorytmów.", request.getAlgorithms().size());

        Problem problem = problemService.getProblemByName(problemName);
        if (problem == null) {
            throw new NoSuchElementException("Nie znaleziono problemu o nazwie: " + problemName);
        }

        List<AlgorithmResult> results = new ArrayList<>();

        for (AlgorithmExecutionRequest algoRequest : request.getAlgorithms()) {
            log.info("Wykonywanie algorytmu: {}", algoRequest.getName());
            Algorithm algorithm = algorithmService.getAlgorithmByName(algoRequest.getName())
                    .orElseThrow(() -> new NoSuchElementException("Nie znaleziono algorytmu: " + algoRequest.getName()));

            AlgorithmResult result = algorithm.execute(problem, request.getProblemParameters(), algoRequest.getParameters());
            results.add(result);
        }

        log.info("Zakończono analizę porównawczą. Zwracam {} wyników.", results.size());
        return ResponseEntity.ok(results);
    }

    // Upewnij się, że ta klasa jest publiczna i statyczna, aby Jackson nie miał problemów
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