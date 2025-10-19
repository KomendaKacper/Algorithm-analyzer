package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.dto.FinalMetricData;
import com.example.algorithm_analyzer.dto.IterationResult;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
public abstract class AbstractAlgorithm implements Algorithm {

    @Override
    public final AlgorithmResult execute(Problem problem, Map<String, Object> problemParameters, Map<String, Object> algorithmParameters) {
        long startTime = System.currentTimeMillis();
        AlgorithmResult result = new AlgorithmResult();
        result.setAlgorithmName(this.getName());
        result.setProblemName(problem.getName());

        try {
            problem.initialize(problemParameters);

            ExecutionResult executionResult = solve(problem, algorithmParameters);

            result.setSuccess(true);
            result.setBestSolution(executionResult.bestSolution(), executionResult.bestScore());
            result.setIterationResults(new ArrayList<>(executionResult.iterationResults()));
            result.setNodes(problem.getAllElements());
            result.setFinalMetrics(executionResult.finalMetrics());
            result.setSpecificMetricLabels(getSpecificMetricLabels());

        } catch (Exception e) {
            log.error("Błąd podczas wykonywania algorytmu '{}'", this.getName(), e);
            result.setError(e.getMessage());
            result.setSuccess(false);
        }

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    protected abstract ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters);

    protected Map<String, String> getSpecificMetricLabels() {
        return Map.of();
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

