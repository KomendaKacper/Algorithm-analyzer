// src/main/java/com/example/algorithm_analyzer/algorithms/TabuSearchAlgorithm.java
package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.FinalMetricData;
import com.example.algorithm_analyzer.dto.IterationResult;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
@Slf4j
public class TabuSearchAlgorithm extends AbstractAlgorithm {

    @Override
    public String getName() {
        return "Tabu Search (TS)";
    }

    @Override
    public String getDescription() {
        return "Algorytm Przeszukiwania z Tabu. Wykorzystuje pamięć krótkoterminową (listę tabu), aby unikać zapętlania i uciekać z lokalnych optimów.";
    }

    @Override
    public List<ParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
                new ParameterDefinition("iterations", "Liczba iteracji", ParameterType.INTEGER, 1000, 10, 50000, "Całkowita liczba iteracji algorytmu.", true),
                new ParameterDefinition("tabuTenure", "Długość listy tabu (kadencja)", ParameterType.INTEGER, 15, 1, 100, "Liczba iteracji, przez którą ruch pozostaje zakazany.", true),
                new ParameterDefinition("neighborhoodSampleSize", "Rozmiar próbki sąsiedztwa", ParameterType.INTEGER, 50, 5, 500, "Liczba sąsiadów sprawdzanych w każdej iteracji.", true),
                new ParameterDefinition("maxIterationsWithoutImprovement", "Max. iteracji bez poprawy", ParameterType.INTEGER, 200, 20, 10000, "Kryterium stopu: zatrzymaj, jeśli wynik nie poprawi się przez X iteracji.", true)
        );
    }

    @Override
    protected Map<String, String> getSpecificMetricLabels() {
        Map<String, String> labels = new LinkedHashMap<>();
        labels.put("tabuListSize", "Rozmiar Listy Tabu");
        labels.put("aspirationsMet", "Użycie Kryterium Aspiracji");
        labels.put("exploration", "Wymuszone ruchy (wszyscy sąsiedzi Tabu)");
        return labels;
    }

    @Override
    protected ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters) {
        TsParameters params = new TsParameters(algorithmParameters);

        List<String> currentSolution = problem.generateRandomSolution();
        double currentScore = problem.evaluateSolution(currentSolution);

        List<String> bestSolution = new ArrayList<>(currentSolution);
        double bestScore = currentScore;
        double previousBestScore = bestScore;

        // Używamy Set dla szybszego sprawdzania 'contains'
        Queue<List<String>> tabuListQueue = new LinkedList<>();
        Set<List<String>> tabuSet = new HashSet<>();

        List<IterationResult> iterationResults = new ArrayList<>();
        int iterationsWithoutImprovement = 0;
        int improvementCount = 0;

        for (int iter = 0; iter < params.iterations(); iter++) {
            long iterStartTime = System.nanoTime();
            int aspirationsMet = 0;
            double relativeImprovement = 0.0;
            int explorationMove = 0;

            List<String> bestNeighbor = null;
            double bestNeighborScore = problem.isMaximization() ? Double.NEGATIVE_INFINITY : Double.POSITIVE_INFINITY;

            for (int i = 0; i < params.neighborhoodSampleSize(); i++) {
                List<String> candidate = problem.generateNeighborSolution(currentSolution);
                if (!problem.isValidSolution(candidate)) continue;

                double candidateScore = problem.evaluateSolution(candidate);
                boolean isCandidateBetter = problem.isMaximization() ? candidateScore > bestNeighborScore : candidateScore < bestNeighborScore;

                if (isCandidateBetter) {
                    if (!tabuSet.contains(candidate)) {
                        bestNeighbor = candidate;
                        bestNeighborScore = candidateScore;
                    } else {
                        boolean isAspirationMet = problem.isMaximization() ? candidateScore > bestScore : candidateScore < bestScore;
                        if (isAspirationMet) {
                            bestNeighbor = candidate;
                            bestNeighborScore = candidateScore;
                            aspirationsMet++;
                        }
                    }
                }
            }

            if (bestNeighbor == null) {
                // Jeśli wszyscy sąsiedzi są tabu i nie ma aspiracji, wybierz losowy (lub najlepszy z tabu)
                bestNeighbor = problem.generateNeighborSolution(currentSolution);
                bestNeighborScore = problem.evaluateSolution(bestNeighbor);
            }

            boolean isMoveImproving = problem.isMaximization() ? bestNeighborScore > currentScore : bestNeighborScore < currentScore;
            if (!isMoveImproving) {
                explorationMove = 1;
            }

            currentSolution = new ArrayList<>(bestNeighbor);
            currentScore = bestNeighborScore;

            // Zarządzanie listą tabu (kolejka + set)
            tabuListQueue.add(currentSolution);
            tabuSet.add(currentSolution);
            if (tabuListQueue.size() > params.tabuTenure()) {
                List<String> removedSolution = tabuListQueue.poll();
                tabuSet.remove(removedSolution); // Usuń z setu, gdy wypada z kolejki
            }

            boolean isCurrentBest = problem.isMaximization() ? currentScore > bestScore : currentScore < bestScore;
            if (isCurrentBest) {
                if (previousBestScore != 0 && Math.abs(previousBestScore) != Double.POSITIVE_INFINITY && bestScore != previousBestScore) {
                    relativeImprovement = Math.abs((currentScore - bestScore) / bestScore);
                }

                previousBestScore = bestScore;
                bestSolution = new ArrayList<>(currentSolution);
                bestScore = currentScore;
                iterationsWithoutImprovement = 0;
                improvementCount++;
            } else {
                iterationsWithoutImprovement++;
            }

            iterationResults.add(
                    IterationResult.builder()
                            .iteration(iter)
                            .bestScore(bestScore)
                            .bestSolution(new ArrayList<>(bestSolution))
                            .currentScore(currentScore)
                            .currentSolution(new ArrayList<>(currentSolution))
                            .executionDurationMs((System.nanoTime() - iterStartTime) / 1_000_000.0)
                            .specificMetrics(Map.of(
                                    "stagnation", iterationsWithoutImprovement,
                                    "improvements", improvementCount,
                                    "tabuListSize", tabuSet.size(),
                                    "aspirationsMet", aspirationsMet,
                                    "exploration", explorationMove,
                                    "relativeImprovement", relativeImprovement
                            ))
                            .build()
            );

            if (iterationsWithoutImprovement >= params.maxIterationsWithoutImprovement()) {
                log.info("Zatrzymano Tabu Search z powodu braku poprawy przez {} iteracji.", params.maxIterationsWithoutImprovement());
                break;
            }
        }

        // --- ZMIANA: Usunięto dodawanie macierzy odległości ---
        Map<String, FinalMetricData> finalMetrics = new HashMap<>();

        return new ExecutionResult(bestSolution, bestScore, iterationResults, finalMetrics);
    }

    private record TsParameters(int iterations, int tabuTenure, int neighborhoodSampleSize, int maxIterationsWithoutImprovement) {
        TsParameters(Map<String, Object> params) {
            this(
                    ((Number) (params != null ? params.getOrDefault("iterations", 1000) : 1000)).intValue(),
                    ((Number) (params != null ? params.getOrDefault("tabuTenure", 15) : 15)).intValue(),
                    ((Number) (params != null ? params.getOrDefault("neighborhoodSampleSize", 50) : 50)).intValue(),
                    ((Number) (params != null ? params.getOrDefault("maxIterationsWithoutImprovement", 200) : 200)).intValue()
            );
        }
    }
}