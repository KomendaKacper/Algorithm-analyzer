package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.dto.FinalMetricData;
import com.example.algorithm_analyzer.dto.IterationResult;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.LinkedHashMap; // Ważne dla kolejności wykresów
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@Slf4j
public abstract class AbstractAlgorithm implements Algorithm {

    public static final int DEFAULT_TIMEOUT_SECONDS = 30;

    @Override
    public final AlgorithmResult execute(Problem problem, Map<String, Object> problemParameters, Map<String, Object> algorithmParameters) {
        long startTime = System.currentTimeMillis();
        AlgorithmResult result = new AlgorithmResult();
        result.setAlgorithmName(this.getName());
        result.setProblemName(problem.getName());

        int timeout;
        try {
            timeout = (Integer) algorithmParameters.getOrDefault("executionTimeout", DEFAULT_TIMEOUT_SECONDS);
        } catch (Exception e) {
            timeout = DEFAULT_TIMEOUT_SECONDS;
        }

        ExecutorService executor = Executors.newSingleThreadExecutor();
        Callable<ExecutionResult> solveTask = () -> {
            problem.initialize(problemParameters);
            return solve(problem, algorithmParameters);
        };

        Future<ExecutionResult> future = executor.submit(solveTask);

        try {
            ExecutionResult executionResult = future.get(timeout, TimeUnit.SECONDS);

            result.setSuccess(true);
            result.setBestSolution(executionResult.bestSolution(), executionResult.bestScore());
            result.setIterationResults(new ArrayList<>(executionResult.iterationResults()));
            result.setNodes(problem.getAllElements());
            result.setFinalMetrics(executionResult.finalMetrics());

        } catch (TimeoutException e) {
            future.cancel(true);
            log.warn("Algorytm '{}' przekroczył limit czasu ({}s).", this.getName(), timeout);
            result.setError("Przekroczono limit czasu (" + timeout + "s).");
            result.setSuccess(false);
            // Jeśli mamy jakieś cząstkowe wyniki (niezaimplementowane tutaj, ale możliwe w przyszłości), tu moglibyśmy je dodać
        } catch (InterruptedException e) {
            future.cancel(true);
            log.warn("Wątek algorytmu '{}' został przerwany.", this.getName(), e);
            result.setError("Wykonanie przerwane.");
            result.setSuccess(false);
        } catch (Exception e) {
            log.error("Błąd algorytmu '{}'", this.getName(), e);
            result.setError(e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
            result.setSuccess(false);
        } finally {
            executor.shutdownNow();
        }

        // --- ZMIANA: Ustawiamy etykiety ZAWSZE, nawet po błędzie ---
        // Dzięki temu frontend wie, jakie wykresy 'powinien' był pokazać
        result.setSpecificMetricLabels(getSpecificMetricLabels());

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    protected abstract ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters);

    // Domyślna implementacja - pusta mapa (LinkedHashMap dla zachowania kolejności w razie nadpisania)
    protected Map<String, String> getSpecificMetricLabels() {
        return new LinkedHashMap<>();
    }

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