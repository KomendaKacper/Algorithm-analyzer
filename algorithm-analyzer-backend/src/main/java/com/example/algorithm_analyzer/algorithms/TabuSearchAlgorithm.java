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
public class TabuSearchAlgorithm implements Algorithm {

    // ... (metody getName, getDescription, getParameterDefinitions bez zmian) ...
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
    public AlgorithmResult execute(Problem problem, Map<String, Object> problemParameters, Map<String, Object> algorithmParameters) {
        long startTime = System.currentTimeMillis();
        try {
            problem.initialize(problemParameters);
            TsParameters params = new TsParameters(algorithmParameters);

            ExecutionResult finalResult = runTabuSearch(problem, params);

            AlgorithmResult result = new AlgorithmResult();
            result.setAlgorithmName(this.getName());
            result.setProblemName(problem.getName());
            result.setSuccess(true);
            result.setBestSolution(finalResult.bestSolution(), finalResult.bestScore());
            result.setIterationResults(new ArrayList<>(finalResult.iterationResults()));
            result.setExecutionDurationMs(System.currentTimeMillis() - startTime);

            // --- NOWA LOGIKA: Dodajemy dane końcowe do wyniku ---
            result.setNodes(problem.getAllElements());
            result.setFinalMetrics(problem.getProblemData()); // Np. macierz odległości dla TSP
            result.setSpecificMetricLabels(Map.of(
                    "tabuListSize", "🔒 Rozmiar Listy Tabu",
                    "aspirationsMet", "✨ Liczba Aspiracji",
                    "distances", "🗺️ Macierz Odległości"
            ));

            return result;

        } catch (Exception e) {
            log.error("Błąd podczas wykonywania Tabu Search", e);
            AlgorithmResult errorResult = new AlgorithmResult();
            errorResult.setError(e.getMessage());
            return errorResult;
        }
    }

    private ExecutionResult runTabuSearch(Problem problem, TsParameters params) {
        // ... (logika runTabuSearch bez zmian) ...
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

            boolean isMoveImproving = problem.isMaximization() ? bestNeighborScore > currentScore : bestNeighborScore < currentScore;
            if (!isMoveImproving) {
                explorationMove = 1;
            }

            currentSolution = new ArrayList<>(bestNeighbor);
            currentScore = bestNeighborScore;

            tabuList.add(currentSolution);
            if (tabuList.size() > params.tabuTenure()) {
                tabuList.poll();
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

            if (iterationsWithoutImprovement >= params.maxIterationsWithoutImprovement()) {
                log.info("Zatrzymano Tabu Search z powodu braku poprawy przez {} iteracji.", params.maxIterationsWithoutImprovement());
                break;
            }
        }

        return new ExecutionResult(bestSolution, bestScore, iterationResults);
    }

    private record TsParameters(int iterations, int tabuTenure, int neighborhoodSampleSize, int maxIterationsWithoutImprovement) {
        TsParameters(Map<String, Object> params) {
            this(
                    ((Number) params.getOrDefault("iterations", 1000)).intValue(),
                    ((Number) params.getOrDefault("tabuTenure", 15)).intValue(),
                    ((Number) params.getOrDefault("neighborhoodSampleSize", 50)).intValue(),
                    ((Number) params.getOrDefault("maxIterationsWithoutImprovement", 200)).intValue()
            );
        }
    }

    private record ExecutionResult(List<String> bestSolution, double bestScore, List<IterationResult> iterationResults) {}
}

