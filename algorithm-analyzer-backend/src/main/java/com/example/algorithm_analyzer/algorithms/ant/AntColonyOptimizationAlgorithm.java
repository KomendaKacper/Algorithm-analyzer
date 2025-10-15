package com.example.algorithm_analyzer.algorithms.ant;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AcoIterationResult;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.entity.Graph;
import com.example.algorithm_analyzer.enums.ParameterType;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
public class AntColonyOptimizationAlgorithm implements Algorithm {

    private final Map<String, Problem> availableProblems;

    public AntColonyOptimizationAlgorithm(List<Problem> problems) {
        this.availableProblems = new HashMap<>();
        for (Problem problem : problems) {
            availableProblems.put(problem.getName(), problem);
        }
    }

    @Override
    public String getName() {
        return "Ant Colony Optimization (ACO)";
    }

    @Override
    public String getDescription() {
        return "Algorytm kolonii mrówek do rozwiązywania problemów optymalizacyjnych";
    }

    @Override
    public List<ParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
                new ParameterDefinition("antCount", "Liczba mrówek", ParameterType.INTEGER,
                        20, 1, 100, "Liczba mrówek w kolonii", true),
                new ParameterDefinition("iterations", "Liczba iteracji", ParameterType.INTEGER,
                        1000, 1, 10000, "Maksymalna liczba iteracji", true),
                new ParameterDefinition("alpha", "Alpha (feromony)", ParameterType.DOUBLE,
                        0.7, 0.1, 5.0, "Waga feromonów", true),
                new ParameterDefinition("beta", "Beta (heurystyka)", ParameterType.DOUBLE,
                        1.2, 0.1, 10.0, "Waga heurystyki", true),
                new ParameterDefinition("evaporationRate", "Współczynnik parowania", ParameterType.DOUBLE,
                        0.1, 0.01, 0.9, "Tempo parowania feromonów", true),
                new ParameterDefinition("pheromoneDeposit", "Depozyt feromonów", ParameterType.DOUBLE,
                        5.0, 0.1, 10.0, "Ilość feromonów odkładanych przez mrówkę", true),
                new ParameterDefinition("elitistWeight", "Współczynnik elitarny", ParameterType.DOUBLE,
                        1.0, 1.0, 10.0, "Współczynnik wzmacniający najlepszą globalną ścieżkę", true)
        );
    }

    @Override
    public AlgorithmResult execute(Graph graph, Map<String, Object> parameters) {
        long startTime = System.currentTimeMillis();
        AlgorithmResult result = new AlgorithmResult();
        result.setAlgorithmName(getName());
        result.setExecutionTime(LocalDateTime.now());

        try {
            // Pobierz typ problemu
            String problemName = (String) parameters.getOrDefault("problemName", "Traveling Salesman Problem (TSP)");
            Problem problem = availableProblems.get(problemName);

            if (problem == null) {
                throw new IllegalArgumentException("Nieznany typ problemu: " + problemName);
            }

            // Inicjalizacja problemu (graf może być null dla problemów bezgrafowych)
            problem.initialize(graph, parameters);

            // Pobierz parametry algorytmu
            Integer antCount = (Integer) parameters.get("antCount");
            Integer iterations = (Integer) parameters.get("iterations");
            Double alpha = parameters.containsKey("alpha") ? ((Number) parameters.get("alpha")).doubleValue() : 0.7;
            Double beta = parameters.containsKey("beta") ? ((Number) parameters.get("beta")).doubleValue() : 1.2;
            Double evaporationRate = parameters.containsKey("evaporationRate") ? ((Number) parameters.get("evaporationRate")).doubleValue() : 0.1;
            Double pheromoneDeposit = parameters.containsKey("pheromoneDeposit") ? ((Number) parameters.get("pheromoneDeposit")).doubleValue() : 5.0;
            Double elitistWeight = parameters.containsKey("elitistWeight") ? ((Number) parameters.get("elitistWeight")).doubleValue() : 1.0;

            // Uruchom algorytm ACO
            AcoResult acoResult = runACO(problem, antCount, iterations, alpha, beta, evaporationRate, pheromoneDeposit, elitistWeight);

            // Przygotuj wyniki
            Map<String, Object> results = new HashMap<>();
            results.put("bestSolution", acoResult.getBestSolution());
            results.put("bestFitness", acoResult.getBestFitness());
            results.put("iterationsToFind", acoResult.getIterationsToFind());
            results.put("problemName", problemName);

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalIterations", iterations);
            statistics.put("antsUsed", antCount);
            statistics.put("convergenceIteration", acoResult.getIterationsToFind());
            statistics.put("finalPheromoneMatrix", acoResult.getFinalPheromones());

            result.setResults(results);
            result.setStatistics(statistics);
            result.setPath(acoResult.getBestSolution());
            result.setPathLength(acoResult.getBestFitness());
            result.setIterationResults(acoResult.getIterationResults());
            result.setSuccess(true);

        } catch (Exception e) {
            log.error("Błąd podczas wykonywania algorytmu ACO", e);
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    // --------------------------------------------
    // Główna logika ACO
    // --------------------------------------------
    private AcoResult runACO(Problem problem, int antCount, int iterations,
                             double alpha, double beta, double evaporationRate,
                             double pheromoneDeposit, double elitistWeight) {

        Map<String, Double> pheromones = initializePheromones(problem);

        List<String> bestSolutionGlobal = null;
        double bestFitnessGlobal = Double.MAX_VALUE;
        int lastImprovementIter = -1;

        List<AcoIterationResult> iterationResults = new ArrayList<>();

        for (int iter = 0; iter < iterations; iter++) {
            long iterStartTime = System.nanoTime();

            List<String> bestSolutionThisIter = null;
            double bestFitnessThisIter = Double.MAX_VALUE;
            double totalFitness = 0.0;
            int validAnts = 0;
            int constraintViolationsThisIter = 0;

            List<List<String>> allValidSolutions = new ArrayList<>();

            // FAZA 1: Budowanie rozwiązań przez mrówki
            for (int ant = 0; ant < antCount; ant++) {
                List<String> solution = constructSolution(problem, pheromones, alpha, beta);

                if (!problem.isValidSolution(solution)) {
                    constraintViolationsThisIter++;
                    continue;
                }

                double fitness = problem.evaluateSolution(solution);
                validAnts++;
                totalFitness += fitness;
                allValidSolutions.add(solution);

                if (fitness < bestFitnessGlobal) {
                    bestFitnessGlobal = fitness;
                    bestSolutionGlobal = new ArrayList<>(solution);
                    lastImprovementIter = iter;
                }

                if (fitness < bestFitnessThisIter) {
                    bestFitnessThisIter = fitness;
                    bestSolutionThisIter = new ArrayList<>(solution);
                }
            }

            // FAZA 2: Parowanie feromonów
            evaporatePheromones(pheromones, evaporationRate);

            // FAZA 3: Wzmacnianie najlepszej mrówki tej iteracji
            if (bestSolutionThisIter != null) {
                updatePheromones(problem, pheromones, bestSolutionThisIter, bestFitnessThisIter, pheromoneDeposit);
            }

            // FAZA 4: Elitarny najlepszy globalny
            if (bestSolutionGlobal != null && iter > 0) {
                updatePheromones(problem, pheromones, bestSolutionGlobal, bestFitnessGlobal, pheromoneDeposit * elitistWeight);
            }

            // Statystyki iteracji
            double avgFitnessThisIter = validAnts > 0 ? totalFitness / validAnts : Double.NaN;
            double diversity = calculateDiversity(allValidSolutions);
            int stagnationCounter = iter - lastImprovementIter;
            double elapsedMillis = (System.nanoTime() - iterStartTime) / 1_000_000.0;

            iterationResults.add(new AcoIterationResult(
                    iter,
                    bestSolutionThisIter,
                    bestFitnessThisIter,
                    null,
                    avgFitnessThisIter,
                    elapsedMillis,
                    constraintViolationsThisIter,
                    diversity,
                    stagnationCounter,
                    new HashMap<>(pheromones),
                    calculatePheromoneStatistics(pheromones)
            ));
        }

        return new AcoResult(bestSolutionGlobal, bestFitnessGlobal, lastImprovementIter, pheromones, iterationResults);
    }

    private List<String> constructSolution(Problem problem, Map<String, Double> pheromones, double alpha, double beta) {
        List<String> solution = new ArrayList<>();
        String current = problem.getStartElement(); // Może być null dla problemów typu Knapsack

        if (current != null) {
            solution.add(current);
        }

        while (!problem.isSolutionComplete(solution)) {
            List<String> possibleNext = problem.getPossibleNextElements(current, solution);
            if (possibleNext.isEmpty()) break;

            String next = selectNextElement(problem, current, possibleNext, solution, pheromones, alpha, beta);
            if (next == null) break;

            solution.add(next);
            current = next;
        }

        return solution;
    }

    private String selectNextElement(Problem problem, String current, List<String> candidates,
                                     List<String> solution, Map<String, Double> pheromones,
                                     double alpha, double beta) {
        if (candidates.isEmpty()) return null;

        Map<String, Double> probabilities = new HashMap<>();
        double totalProbability = 0;

        for (String candidate : candidates) {
            String key = problem.getPheromoneKey(current, candidate);
            double pheromone = pheromones.getOrDefault(key, 1.0);
            double heuristic = problem.getHeuristicValue(current, candidate);
            double prob = Math.pow(pheromone, alpha) * Math.pow(heuristic, beta);
            probabilities.put(candidate, prob);
            totalProbability += prob;
        }

        if (totalProbability == 0) return candidates.get(new Random().nextInt(candidates.size()));

        double rand = Math.random() * totalProbability;
        double cumulative = 0;
        for (Map.Entry<String, Double> entry : probabilities.entrySet()) {
            cumulative += entry.getValue();
            if (rand <= cumulative) return entry.getKey();
        }

        return candidates.get(new Random().nextInt(candidates.size()));
    }

    private Map<String, Double> initializePheromones(Problem problem) {
        Map<String, Double> pheromones = new HashMap<>();
        List<String> allElements = problem.getAllElements();
        for (String from : allElements) {
            for (String to : allElements) {
                if (!from.equals(to)) {
                    pheromones.put(problem.getPheromoneKey(from, to), 1.0);
                }
            }
        }
        return pheromones;
    }

    private void updatePheromones(Problem problem, Map<String, Double> pheromones,
                                  List<String> solution, double fitness, double deposit) {
        double pheromoneToAdd = deposit / Math.max(Math.abs(fitness), 0.0001);
        for (int i = 0; i < solution.size() - 1; i++) {
            String key = problem.getPheromoneKey(solution.get(i), solution.get(i + 1));
            pheromones.put(key, pheromones.getOrDefault(key, 1.0) + pheromoneToAdd);
        }
    }

    private void evaporatePheromones(Map<String, Double> pheromones, double evaporationRate) {
        pheromones.replaceAll((k, v) -> v * (1 - evaporationRate));
    }

    private double calculateDiversity(List<List<String>> solutions) {
        if (solutions.size() < 2) return 0.0;
        double sumDiff = 0;
        int comparisons = 0;
        for (int i = 0; i < solutions.size(); i++) {
            for (int j = i + 1; j < solutions.size(); j++) {
                sumDiff += solutionDifference(solutions.get(i), solutions.get(j));
                comparisons++;
            }
        }
        return comparisons > 0 ? sumDiff / comparisons : 0.0;
    }

    private double solutionDifference(List<String> sol1, List<String> sol2) {
        int minSize = Math.min(sol1.size(), sol2.size());
        int maxSize = Math.max(sol1.size(), sol2.size());
        int diff = maxSize - minSize;
        for (int i = 0; i < minSize; i++) {
            if (!sol1.get(i).equals(sol2.get(i))) diff++;
        }
        return diff;
    }

    private Map<String, Object> calculatePheromoneStatistics(Map<String, Double> pheromones) {
        Map<String, Object> stats = new HashMap<>();
        if (pheromones.isEmpty()) {
            stats.put("min", 0.0);
            stats.put("max", 0.0);
            stats.put("average", 0.0);
            stats.put("total", 0.0);
            return stats;
        }
        DoubleSummaryStatistics summary = pheromones.values().stream().mapToDouble(Double::doubleValue).summaryStatistics();
        stats.put("min", summary.getMin());
        stats.put("max", summary.getMax());
        stats.put("average", summary.getAverage());
        stats.put("total", summary.getSum());
        stats.put("count", summary.getCount());
        return stats;
    }

    // --------------------------------------------
    // Klasa wewnętrzna wyników ACO
    // --------------------------------------------
    private static class AcoResult {
        private final List<String> bestSolution;
        private final double bestFitness;
        private final int iterationsToFind;
        private final Map<String, Double> finalPheromones;
        private final List<AcoIterationResult> iterationResults;

        public AcoResult(List<String> bestSolution, double bestFitness, int iterationsToFind,
                         Map<String, Double> finalPheromones, List<AcoIterationResult> iterationResults) {
            this.bestSolution = bestSolution;
            this.bestFitness = bestFitness;
            this.iterationsToFind = iterationsToFind;
            this.finalPheromones = finalPheromones;
            this.iterationResults = iterationResults;
        }

        public List<String> getBestSolution() { return bestSolution; }
        public double getBestFitness() { return bestFitness; }
        public int getIterationsToFind() { return iterationsToFind; }
        public Map<String, Double> getFinalPheromones() { return finalPheromones; }
        public List<AcoIterationResult> getIterationResults() { return iterationResults; }
    }
}
