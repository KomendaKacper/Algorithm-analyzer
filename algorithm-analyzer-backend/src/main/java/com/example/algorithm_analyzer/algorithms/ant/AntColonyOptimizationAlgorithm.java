package com.example.algorithm_analyzer.algorithms.ant;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AcoIterationResult;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
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
        return "Algorytm kolonii mrówek do rozwiązywania problemów optymalizacyjnych (macierzowa reprezentacja)";
    }

    @Override
    public List<ParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
                new ParameterDefinition("antCount", "Liczba mrówek", ParameterType.INTEGER, 20, 1, 100, "Liczba mrówek w kolonii", true),
                new ParameterDefinition("iterations", "Liczba iteracji", ParameterType.INTEGER, 1000, 1, 10000, "Maksymalna liczba iteracji", true),
                new ParameterDefinition("alpha", "Alpha (feromony)", ParameterType.DOUBLE, 0.7, 0.1, 5.0, "Waga feromonów", true),
                new ParameterDefinition("beta", "Beta (heurystyka)", ParameterType.DOUBLE, 1.2, 0.1, 10.0, "Waga heurystyki", true),
                new ParameterDefinition("evaporationRate", "Współczynnik parowania", ParameterType.DOUBLE, 0.1, 0.01, 0.9, "Tempo parowania feromonów", true),
                new ParameterDefinition("pheromoneDeposit", "Depozyt feromonów", ParameterType.DOUBLE, 5.0, 0.1, 10.0, "Ilość feromonów odkładanych przez mrówkę", true),
                new ParameterDefinition("elitistWeight", "Współczynnik elitarny", ParameterType.DOUBLE, 1.0, 1.0, 10.0, "Współczynnik wzmacniający najlepszą globalną ścieżkę", true)
        );
    }

    @Override
    public AlgorithmResult execute(Problem problem, Map<String, Object> parameters) {
        double startTime = System.currentTimeMillis();
        AlgorithmResult result = new AlgorithmResult();

        try {
            problem.initialize(parameters);

            // Parametry ACO
            int antCount = (Integer) parameters.getOrDefault("antCount", 20);
            int iterations = (Integer) parameters.getOrDefault("iterations", 1000);
            double alpha = ((Number) parameters.getOrDefault("alpha", 0.7)).doubleValue();
            double beta = ((Number) parameters.getOrDefault("beta", 1.2)).doubleValue();
            double evaporationRate = ((Number) parameters.getOrDefault("evaporationRate", 0.1)).doubleValue();
            double pheromoneDeposit = ((Number) parameters.getOrDefault("pheromoneDeposit", 5.0)).doubleValue();
            double elitistWeight = ((Number) parameters.getOrDefault("elitistWeight", 1.0)).doubleValue();

            // Uruchomienie ACO
            AcoResult acoResult = runACO(problem, antCount, iterations, alpha, beta, evaporationRate, pheromoneDeposit, elitistWeight);

            // Ustawienie wyników w AlgorithmResult
            result.setBestSolution(acoResult.bestSolution, acoResult.bestFitness);
            result.setIterationResults(acoResult.iterationResults);

            Map<String, Object> results = new HashMap<>();
            results.put("bestSolution", acoResult.bestSolution);
            results.put("bestScore", acoResult.bestFitness);
            result.setResults(results);

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalIterations", iterations);
            statistics.put("antsUsed", antCount);
            statistics.put("finalPheromones", acoResult.finalPheromones);
            result.setStatistics(statistics);

            result.setSuccess(true);

        } catch (Exception e) {
            log.error("Błąd podczas wykonywania ACO", e);
            result.setError(e.getMessage());
        }

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    // =============================
    // Logika ACO
    // =============================
    private AcoResult runACO(Problem problem, int antCount, int iterations, double alpha, double beta,
                             double evaporationRate, double pheromoneDeposit, double elitistWeight) {

        Map<String, Double> pheromones = initializePheromones(problem);
        List<String> bestSolutionGlobal = null;
        double bestFitnessGlobal = Double.MAX_VALUE;
        int lastImprovementIter = -1;
        List<AcoIterationResult> iterationResults = new ArrayList<>();

        for (int iter = 0; iter < iterations; iter++) {
            long iterStartTime = System.nanoTime();
            List<String> bestSolutionThisIter = null;
            double bestFitnessThisIter = Double.MAX_VALUE;
            double totalFitness = 0;
            int validAnts = 0;
            List<List<String>> allValidSolutions = new ArrayList<>();

            for (int ant = 0; ant < antCount; ant++) {
                List<String> solution = constructSolution(problem, pheromones, alpha, beta);
                if (!problem.isValidSolution(solution)) continue;

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

            evaporatePheromones(pheromones, evaporationRate);

            if (bestSolutionThisIter != null) {
                updatePheromones(problem, pheromones, bestSolutionThisIter, bestFitnessThisIter, pheromoneDeposit);
            }
            if (bestSolutionGlobal != null && iter > 0) {
                updatePheromones(problem, pheromones, bestSolutionGlobal, bestFitnessGlobal, pheromoneDeposit * elitistWeight);
            }

            double avgFitness = validAnts > 0 ? totalFitness / validAnts : Double.NaN;
            iterationResults.add(new AcoIterationResult(
                    iter,
                    bestSolutionThisIter,
                    bestFitnessThisIter,
                    null, // worstScore
                    avgFitness,
                    (System.nanoTime() - iterStartTime) / 1_000_000.0,
                    0, // constraintViolations
                    calculateDiversity(allValidSolutions),
                    iter - lastImprovementIter,
                    new HashMap<>(pheromones),
                    calculatePheromoneStatistics(pheromones)
            ));
        }

        return new AcoResult(bestSolutionGlobal, bestFitnessGlobal, pheromones, iterationResults);
    }

    // =============================
    // Metody pomocnicze
    // =============================
    private List<String> constructSolution(Problem problem, Map<String, Double> pheromones, double alpha, double beta) {
        List<String> solution = new ArrayList<>();
        String current = problem.getStartElement();
        if (current != null) solution.add(current);

        while (!problem.isSolutionComplete(solution)) {
            List<String> candidates = problem.getPossibleNextElements(current, solution);
            if (candidates.isEmpty()) break;
            String next = selectNextElement(problem, current, candidates, pheromones, alpha, beta);
            solution.add(next);
            current = next;
        }
        return solution;
    }

    private String selectNextElement(Problem problem, String current, List<String> candidates,
                                     Map<String, Double> pheromones, double alpha, double beta) {
        Map<String, Double> probs = new HashMap<>();
        double total = 0;

        for (String c : candidates) {
            double pher = pheromones.getOrDefault(problem.getPheromoneKey(current, c), 1.0);
            double heur = problem.getHeuristicValue(current, c);
            double val = Math.pow(pher, alpha) * Math.pow(heur, beta);
            probs.put(c, val);
            total += val;
        }

        double rand = Math.random() * total;
        double cum = 0;
        for (Map.Entry<String, Double> e : probs.entrySet()) {
            cum += e.getValue();
            if (rand <= cum) return e.getKey();
        }
        return candidates.get(new Random().nextInt(candidates.size()));
    }

    private Map<String, Double> initializePheromones(Problem problem) {
        Map<String, Double> pher = new HashMap<>();
        List<String> elements = problem.getAllElements();
        for (String from : elements) {
            for (String to : elements) {
                if (!from.equals(to)) {
                    pher.put(problem.getPheromoneKey(from, to), 1.0);
                }
            }
        }
        return pher;
    }

    private void updatePheromones(Problem problem, Map<String, Double> pheromones,
                                  List<String> solution, double fitness, double deposit) {
        double add = deposit / Math.max(Math.abs(fitness), 1e-6);
        for (int i = 0; i < solution.size() - 1; i++) {
            String key = problem.getPheromoneKey(solution.get(i), solution.get(i + 1));
            pheromones.put(key, pheromones.getOrDefault(key, 1.0) + add);
        }
    }

    private void evaporatePheromones(Map<String, Double> pheromones, double rate) {
        pheromones.replaceAll((k, v) -> v * (1 - rate));
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
            stats.put("count", 0);
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

    // =============================
    // Klasa pomocnicza AcoResult
    // =============================
    private static class AcoResult {
        List<String> bestSolution;
        double bestFitness;
        Map<String, Double> finalPheromones;
        List<AcoIterationResult> iterationResults;

        public AcoResult(List<String> bestSolution, double bestFitness,
                         Map<String, Double> finalPheromones,
                         List<AcoIterationResult> iterationResults) {
            this.bestSolution = bestSolution;
            this.bestFitness = bestFitness;
            this.finalPheromones = finalPheromones;
            this.iterationResults = iterationResults;
        }
    }
}
