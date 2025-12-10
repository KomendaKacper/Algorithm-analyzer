// src/main/java/com/example/algorithm_analyzer/algorithms/SimulatedAnnealingAlgorithm.java
package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.FinalMetricData;
import com.example.algorithm_analyzer.dto.IterationResult;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import com.example.algorithm_analyzer.problems.Problem;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class SimulatedAnnealingAlgorithm extends AbstractAlgorithm {

    @Override
    public String getName() { return "Simulated Annealing (SA)"; }

    @Override
    public String getDescription() { return "Algorytm Symulowanego Wyżarzania inspirowany procesem metalurgicznym."; }

    @Override
    public List<ParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
                new ParameterDefinition("initialTemperature", "Temperatura początkowa", ParameterType.DOUBLE, 10000.0, 1.0, 100000.0, "Wysoka temperatura startowa.", true),
                new ParameterDefinition("coolingRate", "Współczynnik schładzania", ParameterType.DOUBLE, 0.995, 0.8, 0.9999, "Mnożnik temperatury w każdej iteracji.", true),
                new ParameterDefinition("stoppingTemperature", "Temperatura końcowa", ParameterType.DOUBLE, 0.1, 0.001, 100.0, "Próg zatrzymania algorytmu.", true),
                new ParameterDefinition("iterationsPerTemp", "Iteracje na poziom temp.", ParameterType.INTEGER, 100, 1, 10000, "Liczba prób na każdym poziomie temperatury.", true)
        );
    }

    @Override
    protected Map<String, String> getSpecificMetricLabels() {
        // Poprawione etykiety właściwe dla SA (wcześniej były tu omyłkowo feromony z ACO)
        Map<String, String> labels = new LinkedHashMap<>();
        labels.put("temperature", "Temperatura");
        labels.put("acceptanceProbability", "Prawdopodobieństwo Akceptacji");
        return labels;
    }

    @Override
    protected ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters) {
        SaParameters params = new SaParameters(algorithmParameters);

        List<String> currentSolution = problem.generateRandomSolution();
        if (!problem.isValidSolution(currentSolution)) currentSolution = new ArrayList<>();
        double currentScore = problem.evaluateSolution(currentSolution);

        List<String> bestSolution = new ArrayList<>(currentSolution);
        double bestScore = currentScore;
        double oldBestScore = bestScore;

        List<IterationResult> iterationResults = new ArrayList<>();
        double temperature = params.initialTemperature();
        int iteration = 0;
        int lastImprovementIter = 0;
        int improvementCount = 0;

        while (temperature > params.stoppingTemperature()) {
            long iterStartTime = System.nanoTime();
            int acceptedWorseMoves = 0;

            for (int i = 0; i < params.iterationsPerTemp(); i++) {
                List<String> neighborSolution = problem.generateNeighborSolution(currentSolution);
                if (!problem.isValidSolution(neighborSolution)) continue;

                double neighborScore = problem.evaluateSolution(neighborSolution);
                double deltaScore = problem.isMaximization() ? neighborScore - currentScore : currentScore - neighborScore;

                if (deltaScore > 0 || Math.exp(deltaScore / temperature) > ThreadLocalRandom.current().nextDouble()) {
                    currentSolution = new ArrayList<>(neighborSolution);
                    currentScore = neighborScore;
                    if (deltaScore < 0) acceptedWorseMoves++;
                }

                if (problem.isMaximization() ? currentScore > bestScore : currentScore < bestScore) {
                    bestSolution = new ArrayList<>(currentSolution);
                    bestScore = currentScore;
                    lastImprovementIter = iteration;
                    improvementCount++;
                }
            }

            double relativeImprovement = 0.0;
            if (bestScore != oldBestScore && Double.isFinite(oldBestScore) && oldBestScore != 0) {
                relativeImprovement = Math.abs((bestScore - oldBestScore) / oldBestScore);
            }
            oldBestScore = bestScore;

            double referenceWorseScore = problem.isMaximization() ? currentScore * 0.9 : currentScore * 1.1;
            double deltaForProb = problem.isMaximization() ? referenceWorseScore - currentScore : currentScore - referenceWorseScore;
            double acceptanceProbability = Math.exp(deltaForProb / temperature);

            long iterEndTime = System.nanoTime();
            iterationResults.add(
                    IterationResult.builder()
                            .iteration(iteration)
                            .bestScore(bestScore)
                            .bestSolution(new ArrayList<>(bestSolution))
                            .currentScore(currentScore)
                            .currentSolution(new ArrayList<>(currentSolution))
                            .executionDurationMs((iterEndTime - iterStartTime) / 1_000_000.0)
                            .specificMetrics(Map.of(
                                    "exploration", (double) acceptedWorseMoves,
                                    "stagnation", iteration - lastImprovementIter,
                                    "improvements", improvementCount,
                                    "relativeImprovement", relativeImprovement,
                                    "temperature", temperature,
                                    "acceptanceProbability", acceptanceProbability
                            ))
                            .build()
            );

            temperature *= params.coolingRate();
            iteration++;
        }

        // --- ZMIANA: Usunięto dodawanie macierzy odległości ---
        Map<String, FinalMetricData> finalMetrics = new HashMap<>();

        return new ExecutionResult(bestSolution, bestScore, iterationResults, finalMetrics);
    }

    private record SaParameters(double initialTemperature, double coolingRate, double stoppingTemperature, int iterationsPerTemp) {
        SaParameters(Map<String, Object> params) {
            this(
                    ((Number) (params != null ? params.getOrDefault("initialTemperature", 10000.0) : 10000.0)).doubleValue(),
                    ((Number) (params != null ? params.getOrDefault("coolingRate", 0.995) : 0.995)).doubleValue(),
                    ((Number) (params != null ? params.getOrDefault("stoppingTemperature", 0.1) : 0.1)).doubleValue(),
                    ((Number) (params != null ? params.getOrDefault("iterationsPerTemp", 100) : 100)).intValue()
            );
        }
    }
}