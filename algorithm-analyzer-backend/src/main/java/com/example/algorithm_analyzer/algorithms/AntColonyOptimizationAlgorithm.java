package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.FinalMetricData;
import com.example.algorithm_analyzer.dto.IterationResult;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.enums.ParameterType;
import com.example.algorithm_analyzer.problems.Problem;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom; // NOWY IMPORT
import java.util.stream.Collectors;

@Component
public class AntColonyOptimizationAlgorithm extends AbstractAlgorithm {

    @Override
    public String getName() { return "Ant Colony Optimization (ACO)"; }

    @Override
    public String getDescription() { return "Algorytm kolonii mrówek do rozwiązywania problemów optymalizacyjnych."; }

    @Override
    public List<ParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
                new ParameterDefinition("antCount", "Liczba mrówek", ParameterType.INTEGER, 20, 1, 1000, "Liczba mrówek w kolonii", true),
                new ParameterDefinition("iterations", "Liczba iteracji", ParameterType.INTEGER, 1000, 1, 10000, "Maksymalna liczba iteracji", true),
                new ParameterDefinition("alpha", "Alpha (feromony)", ParameterType.DOUBLE, 0.7, 0.1, 5.0, "Waga feromonów", true),
                new ParameterDefinition("beta", "Beta (heurystyka)", ParameterType.DOUBLE, 0.7, 0.1, 10.0, "Waga heurystyki", true),
                new ParameterDefinition("evaporationRate", "Współczynnik parowania", ParameterType.DOUBLE, 0.2, 0.1, 1.0, "Tempo parowania feromonów", true),
                new ParameterDefinition("pheromoneDeposit", "Depozyt feromonów", ParameterType.DOUBLE, 0.3, 0.1, 5.0, "Ilość feromonów odkładanych przez mrówkę", true),
                new ParameterDefinition("elitistWeight", "Współczynnik elitarny", ParameterType.DOUBLE, 1.5, 1.0, 10.0, "Współczynnik wzmacniający najlepszą globalną ścieżkę", true),
                new ParameterDefinition("enableFullPheromoneTracking", "Śledź pełny rozkład feromonów", ParameterType.BOOLEAN, false, null, null, "Uwaga: Znacząco zwiększa zużycie pamięci i rozmiar odpowiedzi.", false)
        );
    }

    @Override
    protected Map<String, String> getSpecificMetricLabels() {
        return Map.of("pheromoneStats", "🐜 Statystyki Feromonów");
    }

    @Override
    protected ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters) {
        AcoParameters params = new AcoParameters(algorithmParameters);
        Map<String, Double> pheromones = initializePheromones(problem);
        List<String> bestSolutionPathGlobal = null;
        double bestFitnessGlobal = problem.isMaximization() ? Double.NEGATIVE_INFINITY : Double.POSITIVE_INFINITY;
        int lastImprovementIter = 0;
        List<IterationResult> iterationResults = new ArrayList<>();
        int improvementCount = 0;

        for (int iter = 0; iter < params.iterations(); iter++) {
            long iterStartTime = System.nanoTime();
            double oldBestFitnessGlobal = bestFitnessGlobal;
            double relativeImprovement = 0.0;
            List<AntSolution> antSolutions = new ArrayList<>();

            for (int ant = 0; ant < params.antCount(); ant++) {
                List<String> path = constructSolution(problem, pheromones, params);
                List<String> solution = problem.convertPathToSolution(path);
                if (problem.isValidSolution(solution)) {
                    antSolutions.add(new AntSolution(path, problem.evaluateSolution(solution)));
                }
            }

            IterationStats iterStats = calculateIterationStats(antSolutions, problem.isMaximization());

            if (iterStats.bestSolutionThisIteration() != null) {
                boolean isBetter = problem.isMaximization() ? iterStats.bestFitnessThisIteration() > bestFitnessGlobal : iterStats.bestFitnessThisIteration() < bestFitnessGlobal;
                if (isBetter) {
                    if (Double.isFinite(oldBestFitnessGlobal) && oldBestFitnessGlobal != 0) {
                        relativeImprovement = Math.abs((iterStats.bestFitnessThisIteration() - oldBestFitnessGlobal) / oldBestFitnessGlobal);
                    }
                    bestFitnessGlobal = iterStats.bestFitnessThisIteration();
                    bestSolutionPathGlobal = new ArrayList<>(iterStats.bestSolutionThisIteration().path());
                    lastImprovementIter = iter;
                    improvementCount++;
                }
            }

            evaporatePheromones(pheromones, params.evaporationRate());
            if (iterStats.bestSolutionThisIteration() != null) {
                updatePheromones(problem, pheromones, iterStats.bestSolutionThisIteration().path(), iterStats.bestFitnessThisIteration(), params.pheromoneDeposit(), problem.isMaximization());
            }
            if (bestSolutionPathGlobal != null) {
                updatePheromones(problem, pheromones, bestSolutionPathGlobal, bestFitnessGlobal, params.pheromoneDeposit() * params.elitistWeight(), problem.isMaximization());
            }

            double diversity = (problem.getStartElement() == null)
                    ? calculateSetDiversity(antSolutions.stream().map(s -> problem.convertPathToSolution(s.path())).collect(Collectors.toList()))
                    : calculateEdgeDiversity(antSolutions.stream().map(AntSolution::path).collect(Collectors.toList()));

            Map<String, Object> metrics = new HashMap<>();
            metrics.put("exploration", diversity);
            metrics.put("stagnation", iter - lastImprovementIter);
            metrics.put("improvements", improvementCount);
            metrics.put("relativeImprovement", relativeImprovement);
            metrics.put("pheromoneStats", calculatePheromoneStatistics(pheromones));
            if (params.enableFullPheromoneTracking()) {
                metrics.put("pheromoneSnapshot", new HashMap<>(pheromones));
            }

            iterationResults.add(
                    IterationResult.builder()
                            .iteration(iter).bestScore(bestFitnessGlobal)
                            .bestSolution(bestSolutionPathGlobal != null ? problem.convertPathToSolution(bestSolutionPathGlobal) : Collections.emptyList())
                            .averageScore(iterStats.averageFitness()).worstScore(iterStats.worstFitness())
                            .executionDurationMs((System.nanoTime() - iterStartTime) / 1_000_000.0)
                            .specificMetrics(metrics).build());
        }

        List<String> finalSolution = (bestSolutionPathGlobal != null) ? problem.convertPathToSolution(bestSolutionPathGlobal) : Collections.emptyList();

        Map<String, FinalMetricData> finalMetrics = new HashMap<>();
        finalMetrics.put("pheromones", new FinalMetricData("🗺️ Macierz Feromonów (Końcowa)", pheromones));

        return new ExecutionResult(finalSolution, bestFitnessGlobal, iterationResults, finalMetrics);
    }

    private IterationStats calculateIterationStats(List<AntSolution> solutions, boolean maximize) { if (solutions.isEmpty()) return new IterationStats(null, maximize ? Double.NEGATIVE_INFINITY : Double.POSITIVE_INFINITY, Double.NaN, maximize ? Double.POSITIVE_INFINITY : Double.NEGATIVE_INFINITY); DoubleSummaryStatistics stats = solutions.stream().mapToDouble(AntSolution::fitness).summaryStatistics(); AntSolution bestInIter = solutions.stream().min((s1, s2) -> maximize ? Double.compare(s2.fitness(), s1.fitness()) : Double.compare(s1.fitness(), s2.fitness())).orElse(null); double bestFitness = bestInIter != null ? bestInIter.fitness() : (maximize ? Double.NEGATIVE_INFINITY : Double.POSITIVE_INFINITY); double worstFitness = maximize ? stats.getMin() : stats.getMax(); return new IterationStats(bestInIter, bestFitness, stats.getAverage(), worstFitness); }
    private List<String> constructSolution(Problem problem, Map<String, Double> pheromones, AcoParameters params) { List<String> path = new ArrayList<>(); String current = problem.getStartElement(); if (current != null) path.add(current); int maxSteps = problem.getAllElements().size() * 2; for (int steps = 0; !problem.isSolutionComplete(path) && steps < maxSteps; steps++) { List<String> candidates = problem.getPossibleNextElements(current, path); if (candidates.isEmpty()) break; String next = selectNextElement(problem, current, candidates, pheromones, params); path.add(next); current = next; } return path; }

    private String selectNextElement(Problem problem, String current, List<String> candidates, Map<String, Double> pheromones, AcoParameters params) {
        Map<String, Double> probabilities = new HashMap<>();
        double totalProbability = 0.0;
        for (String candidate : candidates) {
            double pheromoneLevel = pheromones.getOrDefault(problem.getPheromoneKey(current, candidate), 1.0);
            double heuristicValue = problem.getHeuristicValue(current, candidate);
            double probability = Math.pow(pheromoneLevel, params.alpha()) * Math.pow(heuristicValue, params.beta());
            probabilities.put(candidate, probability);
            totalProbability += probability;
        }

        Random rand = ThreadLocalRandom.current(); // --- ZMIANA: Używamy lepszego generatora ---
        if (totalProbability == 0) {
            return candidates.get(rand.nextInt(candidates.size()));
        }

        double randomValue = rand.nextDouble() * totalProbability;
        double cumulativeProbability = 0.0;
        for (Map.Entry<String, Double> entry : probabilities.entrySet()) {
            cumulativeProbability += entry.getValue();
            if (randomValue <= cumulativeProbability) {
                return entry.getKey();
            }
        }
        return candidates.get(candidates.size() - 1);
    }

    private Map<String, Double> initializePheromones(Problem problem) { Map<String, Double> pheromones = new HashMap<>(); List<String> elements = problem.getAllElements(); elements.forEach(from -> elements.forEach(to -> { if (!from.equals(to)) pheromones.put(problem.getPheromoneKey(from, to), 1.0); })); if (problem.getStartElement() == null) elements.forEach(element -> pheromones.put(problem.getPheromoneKey(null, element), 1.0)); return pheromones; }
    private void updatePheromones(Problem problem, Map<String, Double> pheromones, List<String> path, double fitness, double deposit, boolean maximize) { if (path == null || path.isEmpty()) return; double initialPheromoneToAdd = maximize ? deposit * fitness : deposit / fitness; final double finalPheromoneToAdd = (Double.isInfinite(initialPheromoneToAdd) || Double.isNaN(initialPheromoneToAdd) || initialPheromoneToAdd <= 0) ? deposit : initialPheromoneToAdd; if (problem.getStartElement() == null && !path.isEmpty()) { pheromones.compute(problem.getPheromoneKey(null, path.get(0)), (k, v) -> (v == null ? 1.0 : v) + finalPheromoneToAdd); } for (int i = 0; i < path.size() - 1; i++) { pheromones.compute(problem.getPheromoneKey(path.get(i), path.get(i + 1)), (k, v) -> (v == null ? 1.0 : v) + finalPheromoneToAdd); } }
    private void evaporatePheromones(Map<String, Double> pheromones, double evaporationRate) { pheromones.replaceAll((k, v) -> v * (1.0 - evaporationRate)); }
    private double calculateEdgeDiversity(List<List<String>> paths) { if (paths == null || paths.size() < 2) return 0.0; Set<String> allEdges = new HashSet<>(); paths.forEach(path -> { for (int i = 0; i < path.size() - 1; i++) allEdges.add(path.get(i) + "->" + path.get(i + 1)); }); return allEdges.size(); }
    private double calculateSetDiversity(List<List<String>> solutions) { if (solutions == null || solutions.size() < 2) return 0.0; List<Set<String>> solutionSets = solutions.stream().map(HashSet::new).collect(Collectors.toList()); double totalDistance = 0; int pairCount = 0; for (int i = 0; i < solutionSets.size(); i++) { for (int j = i + 1; j < solutionSets.size(); j++) { Set<String> set1 = solutionSets.get(i), set2 = solutionSets.get(j); if (set1.isEmpty() && set2.isEmpty()) continue; Set<String> intersection = new HashSet<>(set1); intersection.retainAll(set2); Set<String> union = new HashSet<>(set1); union.addAll(set2); if (union.isEmpty()) continue; totalDistance += 1.0 - ((double) intersection.size() / union.size()); pairCount++; } } return (pairCount > 0) ? totalDistance / pairCount : 0.0; }
    private Map<String, Object> calculatePheromoneStatistics(Map<String, Double> pheromones) { if (pheromones.isEmpty()) return Map.of("min", 0.0, "max", 0.0, "average", 0.0); DoubleSummaryStatistics summary = pheromones.values().stream().mapToDouble(d -> d).summaryStatistics(); return Map.of("min", summary.getMin(), "max", summary.getMax(), "average", summary.getAverage()); }

    private record AcoParameters(int antCount, int iterations, double alpha, double beta, double evaporationRate, double pheromoneDeposit, double elitistWeight, boolean enableFullPheromoneTracking) {
        AcoParameters(Map<String, Object> params) {
            // --- KLUCZOWA ZMIANA: PANCERNY KONSTRUKTOR (POPRAWIONY) ---
            this(
                    ((Number) (params != null ? params.getOrDefault("antCount", 20) : 20)).intValue(),
                    ((Number) (params != null ? params.getOrDefault("iterations", 1000) : 1000)).intValue(),
                    ((Number) (params != null ? params.getOrDefault("alpha", 0.7) : 0.7)).doubleValue(),
                    ((Number) (params != null ? params.getOrDefault("beta", 0.7) : 0.7)).doubleValue(),
                    ((Number) (params != null ? params.getOrDefault("evaporationRate", 0.2) : 0.2)).doubleValue(),
                    ((Number) (params != null ? params.getOrDefault("pheromoneDeposit", 0.3) : 0.3)).doubleValue(),
                    ((Number) (params != null ? params.getOrDefault("elitistWeight", 1.5) : 1.5)).doubleValue(),
                    (Boolean) (params != null ? params.getOrDefault("enableFullPheromoneTracking", false) : false)
            );
        }
    }
    private record AntSolution(List<String> path, double fitness) {}
    private record IterationStats(AntSolution bestSolutionThisIteration, double bestFitnessThisIteration, double averageFitness, double worstFitness) {}
}

