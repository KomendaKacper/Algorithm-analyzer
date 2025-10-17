package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AlgorithmInfo;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.problems.Problem;
import com.example.algorithm_analyzer.services.AlgorithmService;
import com.example.algorithm_analyzer.services.ProblemService;
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
        return ResponseEntity.ok(algorithmService.getAllAlgorithms());
    }

    @PostMapping("/{algorithmName}/problems/{problemName}/execute")
    public ResponseEntity<AlgorithmResult> executeAlgorithm(
            @PathVariable String algorithmName,
            @PathVariable String problemName,
            @RequestBody ExecutionRequest request
    ) {
        log.info("Odebrano żądanie wykonania algorytmu: '{}' dla problemu: '{}'", algorithmName, problemName);

        try {
            // --- KLUCZOWA POPRAWKA ---
            // Pobierz problem i sprawdź, czy nie jest nullem
            Problem problem = problemService.getProblemByName(problemName);
            if (problem == null) {
                // Jeśli problem nie istnieje, rzuć wyjątek, który obsłużymy niżej
                throw new NoSuchElementException("Nie znaleziono problemu o nazwie beana: " + problemName);
            }

            Algorithm algorithm = algorithmService.getAlgorithmByName(algorithmName)
                    .orElseThrow(() -> new NoSuchElementException("Nie znaleziono algorytmu o nazwie: " + algorithmName));

            Map<String, Object> problemParams = (request.getProblemParameters() != null)
                    ? request.getProblemParameters() : Collections.emptyMap();
            Map<String, Object> algorithmParams = (request.getAlgorithmParameters() != null)
                    ? request.getAlgorithmParameters() : Collections.emptyMap();

            log.debug("Parametry problemu przekazane do inicjalizacji: {}", problemParams);
            log.debug("Parametry algorytmu przekazane do wykonania: {}", algorithmParams);

            AlgorithmResult result = algorithm.execute(problem, problemParams, algorithmParams);

            return ResponseEntity.ok(result);

        } catch (NoSuchElementException e) {
            log.warn("Nie znaleziono zasobu: {}", e.getMessage());
            AlgorithmResult errorResult = new AlgorithmResult();
            errorResult.setError(e.getMessage());
            return ResponseEntity.status(404).body(errorResult); // Zwróć błąd 404
        } catch (Exception e) {
            log.error("Wystąpił krytyczny błąd podczas wykonywania algorytmu", e);
            AlgorithmResult errorResult = new AlgorithmResult();
            errorResult.setError("Błąd serwera: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResult);
        }
    }

    @PostMapping("/aco/{problemName}/execute")
    public ResponseEntity<?> executeAco(
            @PathVariable String problemName,
            @RequestBody Map<String, Object> parameters
    ) {
        log.warn("Użyto przestarzałego endpointu /aco/{}/execute. Zalecana migracja do nowego API.", problemName);

        ExecutionRequest request = new ExecutionRequest();
        request.setAlgorithmParameters(parameters);
        request.setProblemParameters(parameters);

        return executeAlgorithm("Ant Colony Optimization (ACO)", problemName, request);
    }

    @lombok.Data
    public static class ExecutionRequest {
        private Map<String, Object> algorithmParameters;
        private Map<String, Object> problemParameters;
    }
}