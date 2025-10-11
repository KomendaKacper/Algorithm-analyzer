package com.example.algorithm_analyzer.algorithms.ant;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AcoIterationResult;
import com.example.algorithm_analyzer.dto.AlgorithmParameterDefinition;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.entity.Edge;
import com.example.algorithm_analyzer.entity.Graph;
import com.example.algorithm_analyzer.entity.Node;
import com.example.algorithm_analyzer.enums.ParameterType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
public class AntColonyOptimizationAlgorithm implements Algorithm {

    @Override
    public String getName() {
        return "Ant Colony Optimization (ACO)";
    }

    @Override
    public String getDescription() {
        return "Algorytm kolonii mrówek do znajdowania najkrótszej ścieżki między węzłami";
    }

    @Override
    public List<AlgorithmParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
                new AlgorithmParameterDefinition("antCount", "Liczba mrówek", ParameterType.INTEGER, 20, 1, 100, "Liczba mrówek w kolonii", true),
                new AlgorithmParameterDefinition("iterations", "Liczba iteracji", ParameterType.INTEGER, 1000, 1, 10000, "Maksymalna liczba iteracji", true),
                new AlgorithmParameterDefinition("alpha", "Alpha (feromony)", ParameterType.DOUBLE, 0.7, 0.1, 5.0, "Waga feromonów", true),
                new AlgorithmParameterDefinition("beta", "Beta (heurystyka)", ParameterType.DOUBLE, 1.2, 0.1, 10.0, "Waga heurystyki", true),
                new AlgorithmParameterDefinition("evaporationRate", "Współczynnik parowania", ParameterType.DOUBLE, 0.1, 0.01, 0.9, "Tempo parowania feromonów", true),
                new AlgorithmParameterDefinition("pheromoneDeposit", "Depozyt feromonów", ParameterType.DOUBLE, 5.0, 0.1, 10.0, "Ilość feromonów odkładanych przez mrówkę", true),
                new AlgorithmParameterDefinition("elitistWeight", "Współczynnik elitarny", ParameterType.DOUBLE, 1.0, 1.5, 10.0, "Współczynnik wzmacniający najlepszą globalną ścieżkę", true)
        );
    }

    @Override
    public String getCategory() {
        return "Ant Algorithms";
    }

    @Override
    public AlgorithmResult execute(Graph graph, Map<String, Object> parameters) {
        long startTime = System.currentTimeMillis();
        AlgorithmResult result = new AlgorithmResult();
        result.setAlgorithmName(getName());
        result.setExecutionTime(LocalDateTime.now());
        Random generator = new Random();

        try {
            List<Node> nodeList = new ArrayList<>(graph.getNodes());
            Node startNode = nodeList.get(generator.nextInt(nodeList.size()));
            Integer startNodeId = startNode.getNodeId();

            Integer antCount = (Integer) parameters.get("antCount");
            Integer iterations = (Integer) parameters.get("iterations");
            Double alpha = ((Number) parameters.get("alpha")).doubleValue();
            Double beta = ((Number) parameters.get("beta")).doubleValue();
            Double evaporationRate = ((Number) parameters.get("evaporationRate")).doubleValue();
            Double pheromoneDeposit = ((Number) parameters.get("pheromoneDeposit")).doubleValue();
            Double elitistWeight = ((Number) parameters.get("elitistWeight")).doubleValue();


            if (startNodeId == null) {
                throw new IllegalArgumentException("Start i end node są wymagane");
            }

            if (startNode == null) {
                throw new IllegalArgumentException("Nie można znaleźć węzła startowego lub końcowego");
            }

            AcoResult acoResult = runACO(graph, startNode, antCount, iterations, alpha, beta, evaporationRate, pheromoneDeposit, elitistWeight);

            Map<String, Object> results = new HashMap<>();
            results.put("shortestPath", acoResult.getShortestPath());
            results.put("shortestDistance", acoResult.getShortestDistance());
            results.put("iterationsToFind", acoResult.getIterationsToFind());

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalIterations", iterations);
            statistics.put("antsUsed", antCount);
            statistics.put("coverageInteration", acoResult.getIterationsToFind());
            statistics.put("finalPheromoneMatrix", acoResult.getFinalPheromones());

            result.setResults(results);
            result.setStatistics(statistics);
            result.setPath(acoResult.getShortestPath());
            result.setPathLength(acoResult.getShortestDistance());
            result.setIterationResults(acoResult.getIterationResults());
            result.setSuccess(true);
        } catch (Exception e) {
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    private AcoResult runACO(Graph graph, Node startNode, int antCount, int iterations,
                             double alpha, double beta, double evaporationRate, double pheromoneDeposit, double elitistWeight) {

        List<Node> nodes = new ArrayList<>(graph.getNodes());
        Map<String, Double> pheromones = initializePheromones(graph);

        List<String> bestPathGlobal = null;
        double bestDistanceGlobal = Double.MAX_VALUE;
        int lastImprovementIter = -1;

        List<AcoIterationResult> iterationResults = new ArrayList<>();

        for (int iter = 0; iter < iterations; iter++) {
            long startTime = System.nanoTime();

            List<String> bestPathThisIteration = null;
            double bestDistanceThisIteration = Double.MAX_VALUE;
            double worstDistanceThisIteration = Double.MIN_VALUE;
            double totalDistance = 0.0;
            int validAnts = 0;
            int constraintViolationsThisIteration = 0;

            List<List<String>> allValidPaths = new ArrayList<>();

            // 🔹 FAZA 1: Wszystkie mrówki budują ścieżki (bez odkładania feromonów)
            for (int ant = 0; ant < antCount; ant++) {
                List<String> path = constructPath(startNode, nodes, pheromones, alpha, beta, nodes.size());

                if (path == null || path.size() != nodes.size() + 1) {
                    constraintViolationsThisIteration++;
                    continue;
                }

                double distance = calculatePathDistance(path, graph);
                validAnts++;
                totalDistance += distance;
                allValidPaths.add(path);

                if (distance < bestDistanceGlobal) {
                    bestDistanceGlobal = distance;
                    bestPathGlobal = new ArrayList<>(path);
                    lastImprovementIter = iter;
                }

                if (distance < bestDistanceThisIteration) {
                    bestDistanceThisIteration = distance;
                    bestPathThisIteration = new ArrayList<>(path);
                }

                if (distance > worstDistanceThisIteration) {
                    worstDistanceThisIteration = distance;
                }
            }

            // 🔹 FAZA 2: Parowanie feromonów
            evaporatePheromones(pheromones, evaporationRate);

            // 🔹 FAZA 3: Najlepsza mrówka z tej iteracji wzmacnia feromony
            if (bestPathThisIteration != null) {
                updatePheromones(pheromones, bestPathThisIteration, bestDistanceThisIteration, pheromoneDeposit);
            }

            // 🔹 FAZA 4: Dodatkowo wzmocnij najlepszą globalną ścieżkę (elityzm)
            if (bestPathGlobal != null && iter > 0) {
                updatePheromones(pheromones, bestPathGlobal, bestDistanceGlobal, pheromoneDeposit * elitistWeight);
            }

            double avgDistanceThisIteration = validAnts > 0 ? totalDistance / validAnts : Double.NaN;

            double diversityThisIteration = 0.0;
            int pathCount = allValidPaths.size();
            if (pathCount > 1) {
                double sumDiff = 0;
                int comparisons = 0;
                for (int i = 0; i < pathCount; i++) {
                    for (int j = i + 1; j < pathCount; j++) {
                        sumDiff += pathDifference(allValidPaths.get(i), allValidPaths.get(j));
                        comparisons++;
                    }
                }
                diversityThisIteration = comparisons > 0 ? sumDiff / comparisons : 0;
            }

            int stagnationCounter = iter - lastImprovementIter;
            double elapsedMillis = (System.nanoTime() - startTime) / 1_000_000.0;

            Map<String, Double> pheromoneSnapshot = new HashMap<>(pheromones);
            Map<String, Object> pheromoneStats = calculatePheromoneStatistics(pheromones);

            iterationResults.add(new AcoIterationResult(
                    iter,
                    bestPathThisIteration != null ? bestPathThisIteration : null,
                    bestDistanceThisIteration,
                    worstDistanceThisIteration,
                    avgDistanceThisIteration,
                    elapsedMillis,
                    constraintViolationsThisIteration,
                    diversityThisIteration,
                    stagnationCounter,
                    pheromoneSnapshot,
                    pheromoneStats
            ));
        }

        return new AcoResult(bestPathGlobal, bestDistanceGlobal, lastImprovementIter, pheromones, iterationResults);
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

    private double pathDifference(List<String> path1, List<String> path2) {
        if (path1.size() != path2.size()) return Double.MAX_VALUE;
        int diff = 0;
        for (int i = 0; i < path1.size(); i++) {
            if (!path1.get(i).equals(path2.get(i))) diff++;
        }
        return diff;
    }

    private static class AcoResult {
        private final List<String> shortestPath;
        private final double shortestDistance;
        private final int iterationsToFind;
        private final Map<String, Double> finalPheromones;
        private final List<AcoIterationResult> iterationResults;

        public AcoResult(List<String> shortestPath, double shortestDistance, int iterationsToFind,
                         Map<String, Double> finalPheromones, List<AcoIterationResult> iterationResults) {
            this.shortestPath = shortestPath;
            this.shortestDistance = shortestDistance;
            this.iterationsToFind = iterationsToFind;
            this.finalPheromones = finalPheromones;
            this.iterationResults = iterationResults;
        }

        public List<String> getShortestPath() { return shortestPath; }
        public double getShortestDistance() { return shortestDistance; }
        public int getIterationsToFind() { return iterationsToFind; }
        public Map<String, Double> getFinalPheromones() { return finalPheromones; }
        public List<AcoIterationResult> getIterationResults() { return iterationResults; }
    }

    private Map<String, Double> initializePheromones(Graph graph) {
        Map<String, Double> pheromones = new HashMap<>();
        for (Node node: graph.getNodes()) {
            for (Edge edge: node.getOutgoingEdges()) {
                String key = node.getNodeId() + "-" + edge.getTo().getNodeId();
                pheromones.put(key, 1.0);
            }
        }
        return pheromones;
    }

    private List<String> constructPath(Node start, List<Node> nodes, Map<String, Double> pheromones,
                                       double alpha, double beta, int graphSize) {
        List<String> path = new ArrayList<>();
        Set<Integer> visited = new LinkedHashSet<>();
        Node current = start;

        path.add(current.getNodeId().toString());
        visited.add(current.getNodeId());

        while (visited.size() < graphSize) {
            Node next = selectNextNode(current, visited, pheromones, alpha, beta, graphSize, start);
            if (next == null) return null;

            path.add(next.getNodeId().toString());
            visited.add(next.getNodeId());
            current = next;
        }

        Edge returnEdge = current.getOutgoingEdges().stream()
                .filter(edge -> edge.getTo().getNodeId().equals(start.getNodeId()))
                .findFirst().orElse(null);

        if (returnEdge == null) return null;

        path.add(start.getNodeId().toString());
        return path;
    }

    private Node selectNextNode(Node current, Set<Integer> visited, Map<String, Double> pheromones,
                                double alpha, double beta, int graphSize, Node startNode) {
        List<Edge> availableEdges = current.getOutgoingEdges().stream()
                .filter(edge -> !visited.contains(edge.getTo().getNodeId()))
                .collect(Collectors.toList());

        if (availableEdges.isEmpty()) return null;

        Map<Edge, Double> probabilities = new HashMap<>();
        double totalProbability = 0;

        for (Edge edge : availableEdges) {
            String key = current.getNodeId() + "-" + edge.getTo().getNodeId();
            double pheromone = pheromones.getOrDefault(key, 1.0);
            double heuristic = 1.0 / (edge.getWeight() + 0.001);
            double probability = Math.pow(pheromone, alpha) * Math.pow(heuristic, beta);
            probabilities.put(edge, probability);
            totalProbability += probability;
        }

        double random = Math.random() * totalProbability;
        double cumulative = 0;
        for (Map.Entry<Edge, Double> entry : probabilities.entrySet()) {
            cumulative += entry.getValue();
            if (random <= cumulative) return entry.getKey().getTo();
        }

        return availableEdges.get(new Random().nextInt(availableEdges.size())).getTo();
    }

    private double calculatePathDistance(List<String> path, Graph graph) {
        double distance = 0;
        for (int i = 0; i < path.size() - 1; i++) {
            Integer fromId = Integer.parseInt(path.get(i));
            Integer toId = Integer.parseInt(path.get(i+1));

            Edge edge = findEdge(graph, fromId, toId);
            if (edge != null) distance += edge.getWeight();
        }
        return distance;
    }

    private Edge findEdge(Graph graph, Integer fromId, Integer toId) {
        for (Node node: graph.getNodes()) {
            if (fromId.equals(node.getNodeId())) {
                return node.getOutgoingEdges().stream()
                        .filter(edge -> toId.equals(edge.getTo().getNodeId()))
                        .findFirst().orElse(null);
            }
        }
        return null;
    }

    private void updatePheromones(Map<String, Double> pheromones, List<String> path, double distance, double deposit) {
        double pheromoneToAdd = deposit / distance;
        for (int i = 0; i < path.size() - 1; i++) {
            String key = path.get(i) + "-" + path.get(i+1);
            pheromones.put(key, pheromones.getOrDefault(key, 1.0) + pheromoneToAdd);
        }
    }

    private void evaporatePheromones(Map<String, Double> pheromones, double evaporationRate) {
        pheromones.replaceAll((key, value) -> value * (1 - evaporationRate));
    }
}
