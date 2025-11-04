// Plik: com/example/algorithm_analyzer/algorithms/AbstractAlgorithm.java

package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.dto.FinalMetricData;
import com.example.algorithm_analyzer.dto.IterationResult;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*; // Importy dla ExecutorService

@Slf4j
public abstract class AbstractAlgorithm implements Algorithm {

    // Użyj tej stałej do limitu czasu, możesz ją też pobierać z parametrów
    public static final int DEFAULT_TIMEOUT_SECONDS = 30;

    @Override
    public final AlgorithmResult execute(Problem problem, Map<String, Object> problemParameters, Map<String, Object> algorithmParameters) {
        long startTime = System.currentTimeMillis();
        AlgorithmResult result = new AlgorithmResult();
        result.setAlgorithmName(this.getName());
        result.setProblemName(problem.getName());

        // Pobierz niestandardowy limit czasu lub użyj domyślnego
        int timeout;
        try {
            timeout = (Integer) algorithmParameters.getOrDefault("executionTimeout", DEFAULT_TIMEOUT_SECONDS);
        } catch (Exception e) {
            timeout = DEFAULT_TIMEOUT_SECONDS;
        }

        ExecutorService executor = Executors.newSingleThreadExecutor();
        // Zadanie do wykonania w osobnym wątku
        Callable<ExecutionResult> solveTask = () -> {
            problem.initialize(problemParameters); // Inicjalizacja teraz tutaj
            return solve(problem, algorithmParameters);
        };

        Future<ExecutionResult> future = executor.submit(solveTask);

        try {
            // Czekaj na wynik, ale nie dłużej niż limit czasu
            ExecutionResult executionResult = future.get(timeout, TimeUnit.SECONDS);

            result.setSuccess(true);
            result.setBestSolution(executionResult.bestSolution(), executionResult.bestScore());
            result.setIterationResults(new ArrayList<>(executionResult.iterationResults()));
            result.setNodes(problem.getAllElements());
            result.setFinalMetrics(executionResult.finalMetrics());
            result.setSpecificMetricLabels(getSpecificMetricLabels());

        } catch (TimeoutException e) {
            future.cancel(true); // Przerwij wątek!
            log.warn("Algorytm '{}' przekroczył limit czasu ({}s).", this.getName(), timeout, e);
            result.setError("Przekroczono limit czasu (" + timeout + "s). Możliwa pętla nieskończona.");
            result.setSuccess(false);
        } catch (InterruptedException e) {
            future.cancel(true);
            log.warn("Wątek algorytmu '{}' został przerwany.", this.getName(), e);
            result.setError("Wykonanie algorytmu zostało przerwane.");
            result.setSuccess(false);
        } catch (Exception e) {
            // Błędy rzucone przez sam algorytm (np. błąd w kodzie Groovy)
            log.error("Błąd podczas wykonywania algorytmu '{}'", this.getName(), e.getCause() != null ? e.getCause() : e);
            result.setError(e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
            result.setSuccess(false);
        } finally {
            executor.shutdownNow(); // Zawsze zamykaj executor
        }

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    // Ta metoda pozostaje bez zmian
    protected abstract ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters);

    // Ta metoda pozostaje bez zmian
    protected Map<String, String> getSpecificMetricLabels() {
        return Map.of();
    }

    // Ta metoda pozostaje bez zmian
    protected record ExecutionResult(
            List<String> bestSolution,
            double bestScore,
            List<IterationResult> iterationResults,
            Map<String, FinalMetricData> finalMetrics
    ) {
        public ExecutionResult(List<String> bestSolution, double bestScore, List<IterationResult> iterationResults) {
            this(bestSolution, bestScore, iterationResults, Map.of());
        }
    }
}