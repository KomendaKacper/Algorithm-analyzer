package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.FinalMetricData;
import com.example.algorithm_analyzer.dto.IterationResult;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import com.example.algorithm_analyzer.problems.Problem;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class TabuSearchAlgorithm extends AbstractAlgorithm {

    @Override
    public String getName() {
        return "Tabu Search (TS)";
    }

    @Override
    public String getDescription() {
        return "Algorytm Przeszukiwania z Tabu, który używa pamięci krótkoterminowej.";
    }

    @Override
    public List<ParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
                new ParameterDefinition("iterations", "Liczba iteracji", ParameterType.INTEGER, 1000, 10, 50000, "Całkowita liczba iteracji.", true),
                new ParameterDefinition("tabuTenure", "Długość listy tabu", ParameterType.INTEGER, 15, 1, 100, "Liczba iteracji, przez którą ruch jest zakazany.", true),
                new ParameterDefinition("neighborhoodSampleSize", "Próbka sąsiedztwa", ParameterType.INTEGER, 50, 5, 500, "Liczba sąsiadów sprawdzanych w iteracji.", true)
        );
    }

    @Override
    protected Map<String, String> getSpecificMetricLabels() {
        return Map.of(
                "tabuListSize", "🔒 Rozmiar Listy Tabu",
                "aspirationsMet", "✨ Liczba Aspiracji"
        );
    }

    @Override
    protected ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters) {
        TsParameters params = new TsParameters(algorithmParameters);

        List<String> currentSolution = problem.generateRandomSolution();
        double currentScore = problem.evaluateSolution(currentSolution);

        List<String> bestSolution = new ArrayList<>(currentSolution);
        double bestScore = currentScore;
        double previousBestScore = bestScore;

        Queue<List<String>> tabuList = new LinkedList<>();
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
                    if (!tabuList.contains(candidate)) {
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
                bestNeighbor = problem.generateRandomSolution();
                bestNeighborScore = problem.evaluateSolution(bestNeighbor);
            }

            if (!(problem.isMaximization() ? bestNeighborScore > currentScore : bestNeighborScore < currentScore)) {
                explorationMove = 1;
            }

            currentSolution = new ArrayList<>(bestNeighbor);
            currentScore = bestNeighborScore;

            tabuList.add(currentSolution);
            if (tabuList.size() > params.tabuTenure()) {
                tabuList.poll();
            }

            if (problem.isMaximization() ? currentScore > bestScore : currentScore < bestScore) {
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
                            .executionDurationMs((System.nanoTime() - iterStartTime) / 1_000_000.0)
                            .specificMetrics(Map.of(
                                    "stagnation", iterationsWithoutImprovement,
                                    "improvements", improvementCount,
                                    "tabuListSize", tabuList.size(),
                                    "aspirationsMet", aspirationsMet,
                                    "exploration", explorationMove,
                                    "relativeImprovement", relativeImprovement
                            ))
                            .build()
            );
        }

        Map<String, FinalMetricData> finalMetrics = new HashMap<>();
        if (problem.getProblemData().containsKey("distances")) {
            finalMetrics.put("distances", new FinalMetricData("🗺️ Macierz Odległości", problem.getProblemData().get("distances")));
        }

        return new ExecutionResult(bestSolution, bestScore, iterationResults, finalMetrics);
    }

    private record TsParameters(int iterations, int tabuTenure, int neighborhoodSampleSize) {
        TsParameters(Map<String, Object> params) {
            this(
                    ((Number) params.getOrDefault("iterations", 1000)).intValue(),
                    ((Number) params.getOrDefault("tabuTenure", 15)).intValue(),
                    ((Number) params.getOrDefault("neighborhoodSampleSize", 50)).intValue()
            );
        }
    }
}

