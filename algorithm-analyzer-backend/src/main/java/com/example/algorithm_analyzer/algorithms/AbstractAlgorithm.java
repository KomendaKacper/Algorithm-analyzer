package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dtos.AlgorithmResult;
import com.example.algorithm_analyzer.dtos.FinalMetricData;
import com.example.algorithm_analyzer.dtos.IterationResult;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@Slf4j
public abstract class AbstractAlgorithm implements Algorithm {

    public static final int DEFAULT_TIMEOUT_SECONDS = 120;

    /**
     * Executes the algorithm on the given problem.
     *
     * @param problem             The problem to solve.
     * @param problemParameters   Parameters for problem initialization.
     * @param algorithmParameters Parameters for the algorithm execution.
     * @return The result of the algorithm execution.
     */
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
            log.warn("Algorithm '{}' exceeded time limit ({}s).", this.getName(), timeout);
            result.setError("Time limit exceeded (" + timeout + "s).");
            result.setSuccess(false);
        } catch (InterruptedException e) {
            future.cancel(true);
            log.warn("Algorithm thread '{}' was interrupted.", this.getName(), e);
            result.setError("Execution interrupted.");
            result.setSuccess(false);
        } catch (Exception e) {
            log.error("Error in algorithm '{}'", this.getName(), e);
            result.setError(e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
            result.setSuccess(false);
        } finally {
            executor.shutdownNow();
        }

        result.setSpecificMetricLabels(getSpecificMetricLabels());

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    /**
     * Solves the problem using the specific algorithm implementation.
     *
     * @param problem             The problem to solve.
     * @param algorithmParameters Parameters for the algorithm.
     * @return The result of the execution.
     */
    protected abstract ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters);

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