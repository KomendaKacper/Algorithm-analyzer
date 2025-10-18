package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.dto.IterationResult;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Slf4j
public class SimulatedAnnealingAlgorithm implements Algorithm {

    @Override
    public String getName() {
        return "Simulated Annealing (SA)";
    }

    @Override
    public String getDescription() {
        return "Algorytm Symulowanego Wyżarzania do rozwiązywania problemów optymalizacyjnych, inspirowany procesem metalurgicznym.";
    }

    @Override
    public List<ParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
                new ParameterDefinition("initialTemperature", "Temperatura początkowa", ParameterType.DOUBLE, 10000.0, 1.0, 100000.0, "Wysoka temperatura startowa pozwalająca na eksplorację.", true),
                new ParameterDefinition("coolingRate", "Współczynnik schładzania", ParameterType.DOUBLE, 0.995, 0.8, 0.9999, "Mnożnik temperatury w każdej iteracji (blisko 1 = wolne schładzanie).", true),
                new ParameterDefinition("stoppingTemperature", "Temperatura końcowa", ParameterType.DOUBLE, 0.1, 0.001, 100.0, "Temperatura, przy której algorytm się zatrzymuje.", true),
                new ParameterDefinition("iterationsPerTemp", "Iteracje na poziom temp.", ParameterType.INTEGER, 100, 1, 10000, "Liczba prób wygenerowania sąsiada na każdym poziomie temperatury.", true)
        );
    }

    @Override
    public AlgorithmResult execute(Problem problem, Map<String, Object> problemParameters, Map<String, Object> algorithmParameters) {
        long startTime = System.currentTimeMillis();
        AlgorithmResult result = new AlgorithmResult();
        result.setAlgorithmName(this.getName());
        result.setProblemName(problem.getName());

        try {
            problem.initialize(problemParameters);

            double initialTemperature = ((Number) algorithmParameters.getOrDefault("initialTemperature", 10000.0)).doubleValue();
            double coolingRate = ((Number) algorithmParameters.getOrDefault("coolingRate", 0.995)).doubleValue();
            double stoppingTemperature = ((Number) algorithmParameters.getOrDefault("stoppingTemperature", 0.1)).doubleValue();
            int iterationsPerTemp = ((Number) algorithmParameters.getOrDefault("iterationsPerTemp", 100)).intValue();

            SaResult saResult = runSA(problem, initialTemperature, coolingRate, stoppingTemperature, iterationsPerTemp);

            result.setBestSolution(saResult.bestSolution(), saResult.bestScore());
            result.setIterationResults(new ArrayList<>(saResult.iterationResults()));
            result.setSuccess(true);

        } catch (Exception e) {
            log.error("Błąd podczas wykonywania Symulowanego Wyżarzania", e);
            result.setError(e.getMessage());
            result.setSuccess(false);
        }

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    private SaResult runSA(Problem problem, double initialTemperature, double coolingRate, double stoppingTemperature, int iterationsPerTemp) {
        List<String> currentSolution = problem.generateRandomSolution();

        if (!problem.isValidSolution(currentSolution)) {
            log.warn("Wygenerowano niepoprawne rozwiązanie początkowe dla SA. Może być puste.");
        }

        double currentScore = problem.evaluateSolution(currentSolution);

        List<String> bestSolution = new ArrayList<>(currentSolution);
        double bestScore = currentScore;
        boolean maximize = problem.isMaximization();

        double temperature = initialTemperature;
        List<IterationResult> iterationResults = new ArrayList<>();
        int iteration = 0;
        int lastImprovementIter = 0;
        int improvementCount = 0;


        while (temperature > stoppingTemperature) {
            long iterStartTime = System.nanoTime();
            int acceptedWorseMoves = 0;
            double oldBestScore = bestScore;
            double relativeImprovement = 0.0;

            for (int i = 0; i < iterationsPerTemp; i++) {
                List<String> neighborSolution = problem.generateNeighborSolution(currentSolution);
                if (!problem.isValidSolution(neighborSolution)) {
                    continue;
                }
                double neighborScore = problem.evaluateSolution(neighborSolution);
                double deltaScore = maximize ? neighborScore - currentScore : currentScore - neighborScore;

                if (deltaScore > 0) {
                    currentSolution = new ArrayList<>(neighborSolution);
                    currentScore = neighborScore;
                    if (maximize ? currentScore > bestScore : currentScore < bestScore) {
                        bestScore = currentScore;
                        bestSolution = new ArrayList<>(currentSolution);
                        lastImprovementIter = iteration;
                        improvementCount++;
                    }
                } else if (Math.exp(deltaScore / temperature) > Math.random()) {
                    currentSolution = new ArrayList<>(neighborSolution);
                    currentScore = neighborScore;
                    acceptedWorseMoves++;
                }
            }

            // Oblicz względną poprawę dla całego kroku temperaturowego
            if (bestScore != oldBestScore && Double.isFinite(oldBestScore) && oldBestScore != 0) {
                relativeImprovement = Math.abs((bestScore - oldBestScore) / oldBestScore);
            }

            iterationResults.add(
                    IterationResult.builder()
                            .iteration(iteration)
                            .bestScore(bestScore)
                            .bestSolution(new ArrayList<>(bestSolution))
                            .currentScore(currentScore)
                            .executionDurationMs((System.nanoTime() - iterStartTime) / 1_000_000.0)
                            .specificMetrics(Map.of(
                                    "exploration", (double) acceptedWorseMoves,
                                    "stagnation", iteration - lastImprovementIter,
                                    "improvements", improvementCount,
                                    "relativeImprovement", relativeImprovement,
                                    "temperature", temperature
                            ))
                            .build()
            );

            temperature *= coolingRate;
            iteration++;
        }

        return new SaResult(bestSolution, bestScore, iterationResults);
    }

    private record SaResult(List<String> bestSolution, double bestScore, List<IterationResult> iterationResults) {}
}

