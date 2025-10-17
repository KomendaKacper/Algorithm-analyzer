package com.example.algorithm_analyzer.algorithms.ant;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AcoIterationResult;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Slf4j
public class AntColonyOptimizationAlgorithm implements Algorithm {

    @Override
    public String getName() {
        return "Ant Colony Optimization (ACO)";
    }

    @Override
    public String getDescription() {
        return "Algorytm kolonii mrówek do rozwiązywania problemów optymalizacyjnych.";
    }

    @Override
    public List<ParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
                new ParameterDefinition("antCount", "Liczba mrówek", ParameterType.INTEGER, 20, 1, 1000, "Liczba mrówek w kolonii", true),
                new ParameterDefinition("iterations", "Liczba iteracji", ParameterType.INTEGER, 1000, 1, 10000, "Maksymalna liczba iteracji", true),
                new ParameterDefinition("alpha", "Alpha (feromony)", ParameterType.DOUBLE, 0.7, 0.1, 5.0, "Waga feromonów", true),
                new ParameterDefinition("beta", "Beta (heurystyka)", ParameterType.DOUBLE, 0.7, 0.1, 10.0, "Waga heurystyki", true),
                new ParameterDefinition("evaporationRate", "Współczynnik parowania", ParameterType.DOUBLE, 0.2, 0.1, 1.0, "Tempo parowania feromonów", true),
                new ParameterDefinition("pheromoneDeposit", "Depozyt feromonów", ParameterType.DOUBLE, 0.3, 0.1, 5.0, "Ilość feromonów odkładanych przez mrówkę", true),
                new ParameterDefinition("elitistWeight", "Współczynnik elitarny", ParameterType.DOUBLE, 1.5, 1.0, 10.0, "Współczynnik wzmacniający najlepszą globalną ścieżkę", true)
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

            int antCount = ((Number) algorithmParameters.getOrDefault("antCount", 50)).intValue();
            int iterations = ((Number) algorithmParameters.getOrDefault("iterations", 500)).intValue();
            double alpha = ((Number) algorithmParameters.getOrDefault("alpha", 1.0)).doubleValue();
            double beta = ((Number) algorithmParameters.getOrDefault("beta", 2.5)).doubleValue();
            double evaporationRate = ((Number) algorithmParameters.getOrDefault("evaporationRate", 0.2)).doubleValue();
            double pheromoneDeposit = ((Number) algorithmParameters.getOrDefault("pheromoneDeposit", 100.0)).doubleValue();
            double elitistWeight = ((Number) algorithmParameters.getOrDefault("elitistWeight", 1.5)).doubleValue();

            boolean maximize = problem.isMaximization();
            AcoResult acoResult = runACO(problem, antCount, iterations, alpha, beta, evaporationRate, pheromoneDeposit, elitistWeight, maximize);

            List<String> bestPath = acoResult.bestSolutionPath;
            if (bestPath == null) {
                log.warn("ACO nie znalazło żadnej poprawnej ścieżki. Zwracam puste rozwiązanie.");
                bestPath = Collections.emptyList();
            }

            List<String> finalSolution = problem.convertPathToSolution(bestPath);
            result.setBestSolution(finalSolution, acoResult.bestFitness);

            // --- KLUCZOWA ZMIANA ---
            // Konwertujemy specyficzną listę wyników ACO na ogólną listę obiektów,
            // której oczekuje uniwersalny AlgorithmResult.
            result.setIterationResults(new ArrayList<>(acoResult.iterationResults));

            result.setSuccess(true);

        } catch (Exception e) {
            log.error("Błąd podczas wykonywania ACO", e);
            result.setError(e.getMessage());
            result.setSuccess(false);
        }

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    private AcoResult runACO(Problem problem, int antCount, int iterations, double alpha, double beta,
                             double evaporationRate, double pheromoneDeposit, double elitistWeight, boolean maximize) {

        Map<String, Double> pheromones = initializePheromones(problem);
        List<String> bestSolutionPathGlobal = null;
        double bestFitnessGlobal = maximize ? Double.NEGATIVE_INFINITY : Double.POSITIVE_INFINITY;
        int lastImprovementIter = 0;
        List<AcoIterationResult> iterationResults = new ArrayList<>(); // <-- Ta lista jest typu AcoIterationResult

        for (int iter = 0; iter < iterations; iter++) {
            long iterStartTime = System.nanoTime();
            List<List<String>> allAntPaths = new ArrayList<>();
            double bestFitnessThisIter = maximize ? Double.NEGATIVE_INFINITY : Double.POSITIVE_INFINITY;
            List<String> bestPathThisIter = null;

            for (int ant = 0; ant < antCount; ant++) {
                List<String> path = constructSolution(problem, pheromones, alpha, beta);
                allAntPaths.add(path);

                List<String> solution = problem.convertPathToSolution(path);
                if (!problem.isValidSolution(solution)) continue;

                double fitness = problem.evaluateSolution(solution);
                if ((maximize && fitness > bestFitnessThisIter) || (!maximize && fitness < bestFitnessThisIter)) {
                    bestFitnessThisIter = fitness;
                    bestPathThisIter = path;
                }
            }

            evaporatePheromones(pheromones, evaporationRate);

            if (bestPathThisIter != null) {
                updatePheromones(problem, pheromones, bestPathThisIter, bestFitnessThisIter, pheromoneDeposit, maximize);
                if ((maximize && bestFitnessThisIter > bestFitnessGlobal) || (!maximize && bestFitnessThisIter < bestFitnessGlobal)) {
                    bestFitnessGlobal = bestFitnessThisIter;
                    bestSolutionPathGlobal = new ArrayList<>(bestPathThisIter);
                    lastImprovementIter = iter;
                }
            }
            if (bestSolutionPathGlobal != null) {
                updatePheromones(problem, pheromones, bestSolutionPathGlobal, bestFitnessGlobal, pheromoneDeposit * elitistWeight, maximize);
            }

            iterationResults.add(new AcoIterationResult(iter,
                    bestSolutionPathGlobal != null ? problem.convertPathToSolution(bestSolutionPathGlobal) : null,
                    bestFitnessGlobal, null, Double.NaN,
                    (System.nanoTime() - iterStartTime) / 1_000_000.0,
                    0, calculateDiversity(allAntPaths), iter - lastImprovementIter,
                    new HashMap<>(pheromones), calculatePheromoneStatistics(pheromones)));
        }
        return new AcoResult(bestSolutionPathGlobal, bestFitnessGlobal, pheromones, iterationResults);
    }

    private List<String> constructSolution(Problem problem, Map<String, Double> pheromones, double alpha, double beta) {
        List<String> path = new ArrayList<>();
        String current = problem.getStartElement();
        if (current != null) path.add(current);

        int maxSteps = problem.getAllElements().size() * 2;
        for (int steps = 0; !problem.isSolutionComplete(path) && steps < maxSteps; steps++) {
            List<String> candidates = problem.getPossibleNextElements(current, path);
            if (candidates.isEmpty()) break;
            String next = selectNextElement(problem, current, candidates, pheromones, alpha, beta);
            path.add(next);
            current = next;
        }
        return path;
    }

    private String selectNextElement(Problem problem, String current, List<String> candidates,
                                     Map<String, Double> pheromones, double alpha, double beta) {
        Map<String, Double> probabilities = new HashMap<>();
        double totalProbability = 0.0;
        for (String candidate : candidates) {
            double pheromoneLevel = pheromones.getOrDefault(problem.getPheromoneKey(current, candidate), 1.0);
            double heuristicValue = problem.getHeuristicValue(current, candidate);
            double probability = Math.pow(pheromoneLevel, alpha) * Math.pow(heuristicValue, beta);
            probabilities.put(candidate, probability);
            totalProbability += probability;
        }
        if (totalProbability == 0) return candidates.get(new Random().nextInt(candidates.size()));
        double randomValue = Math.random() * totalProbability;
        double cumulativeProbability = 0.0;
        for (Map.Entry<String, Double> entry : probabilities.entrySet()) {
            cumulativeProbability += entry.getValue();
            if (randomValue <= cumulativeProbability) return entry.getKey();
        }
        return candidates.get(candidates.size() - 1);
    }

    private Map<String, Double> initializePheromones(Problem problem) {
        Map<String, Double> pheromones = new HashMap<>();
        List<String> elements = problem.getAllElements();
        for (String from : elements) {
            for (String to : elements) {
                if (!from.equals(to)) pheromones.put(problem.getPheromoneKey(from, to), 1.0);
            }
        }
        if (problem.getStartElement() == null) {
            for (String element : elements) pheromones.put(problem.getPheromoneKey(null, element), 1.0);
        }
        return pheromones;
    }

    private void updatePheromones(Problem problem, Map<String, Double> pheromones, List<String> path,
                                  double fitness, double deposit, boolean maximize) {
        if (path == null || path.isEmpty()) return;

        double initialPheromoneToAdd = maximize ? deposit * fitness : deposit / fitness;
        final double finalPheromoneToAdd;
        if (Double.isInfinite(initialPheromoneToAdd) || Double.isNaN(initialPheromoneToAdd) || initialPheromoneToAdd <= 0) {
            finalPheromoneToAdd = deposit;
        } else {
            finalPheromoneToAdd = initialPheromoneToAdd;
        }

        if (problem.getStartElement() == null && !path.isEmpty()) {
            pheromones.compute(problem.getPheromoneKey(null, path.get(0)), (k, v) -> (v == null ? 1.0 : v) + finalPheromoneToAdd);
        }
        for (int i = 0; i < path.size() - 1; i++) {
            pheromones.compute(problem.getPheromoneKey(path.get(i), path.get(i + 1)), (k, v) -> (v == null ? 1.0 : v) + finalPheromoneToAdd);
        }
    }

    private void evaporatePheromones(Map<String, Double> pheromones, double evaporationRate) {
        pheromones.replaceAll((key, value) -> value * (1.0 - evaporationRate));
    }

    private double calculateDiversity(List<List<String>> paths) {
        if (paths == null || paths.size() < 2) return 0.0;
        Set<String> allEdges = new HashSet<>();
        paths.forEach(path -> {
            for (int i = 0; i < path.size() - 1; i++) allEdges.add(path.get(i) + "->" + path.get(i + 1));
        });
        return allEdges.size();
    }

    private Map<String, Object> calculatePheromoneStatistics(Map<String, Double> pheromones) {
        Map<String, Object> stats = new HashMap<>();
        if (pheromones.isEmpty()) {
            stats.put("min", 0.0); stats.put("max", 0.0); stats.put("average", 0.0);
            return stats;
        }
        DoubleSummaryStatistics summary = pheromones.values().stream().mapToDouble(d -> d).summaryStatistics();
        stats.put("min", summary.getMin());
        stats.put("max", summary.getMax());
        stats.put("average", summary.getAverage());
        return stats;
    }

    private static class AcoResult {
        final List<String> bestSolutionPath;
        final double bestFitness;
        final Map<String, Double> finalPheromones;
        final List<AcoIterationResult> iterationResults;
        AcoResult(List<String> bestSolutionPath, double bestFitness, Map<String, Double> finalPheromones, List<AcoIterationResult> iterationResults) {
            this.bestSolutionPath = bestSolutionPath; this.bestFitness = bestFitness;
            this.finalPheromones = finalPheromones; this.iterationResults = iterationResults;
        }
    }
}