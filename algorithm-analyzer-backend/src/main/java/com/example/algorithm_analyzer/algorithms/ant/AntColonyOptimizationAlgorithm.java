package com.example.algorithm_analyzer.algorithms.ant;

import com.example.algorithm_analyzer.algorithms.Algorithm;
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
                new AlgorithmParameterDefinition("startNodeId", "Węzeł startowy", ParameterType.NODE_ID, null, null, null, "ID węzła startowego", true),
                new AlgorithmParameterDefinition("endNodeId", "Węzeł końcowy", ParameterType.NODE_ID, null, null, null, "ID węzła końcowego", true),
                new AlgorithmParameterDefinition("antCount", "Liczba mrówek", ParameterType.INTEGER, 10, 1, 100, "Liczba mrówek w kolonii", true),
                new AlgorithmParameterDefinition("iterations", "Liczba iteracji", ParameterType.INTEGER, 100, 1, 1000, "Maksymalna liczba iteracji", true),
                new AlgorithmParameterDefinition("alpha", "Alpha (feromony)", ParameterType.DOUBLE, 1.0, 0.1, 5.0, "Waga feromonów", true),
                new AlgorithmParameterDefinition("beta", "Beta (heurystyka)", ParameterType.DOUBLE, 2.0, 0.1, 5.0, "Waga feromonów", true),
                new AlgorithmParameterDefinition("evaporationRate", "Współczynnik parowania", ParameterType.DOUBLE, 0.1, 0.01, 0.9, "Tempo parowania feromonów", true),
                new AlgorithmParameterDefinition("pheromoneDeposit", "Depozyt feromonów", ParameterType.DOUBLE, 1.0, 0.1, 10.0, "Ilość feromonów odkładanych przez mrówkę", true)
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

        try {
            Integer startNodeId = (Integer) parameters.get("startNodeId");
            Integer endNodeId = (Integer) parameters.get("endNodeId");
            Integer antCount = (Integer) parameters.get("antCount");
            Integer iterations = (Integer) parameters.get("iterations");
            Double alpha = (Double) parameters.get("alpha");
            Double beta = (Double) parameters.get("beta");
            Double evaporationRate = (Double) parameters.get("evaporationRate");
            Double pheromoneDeposit = (Double) parameters.get("pheromoneDeposit");

            if (startNodeId == null || endNodeId == null) {
                throw new IllegalArgumentException("Start i end node są wymagane");
            }

            Node startNode = findNodeById(graph, startNodeId);
            Node endNode = findNodeById(graph, endNodeId);

            if (startNode == null || endNode == null) {
                throw new IllegalArgumentException("Nie można znaleźć węzła startowego lub końcowego");
            }

            AcoResult acoResult = runACO(graph, startNode, endNode, antCount, iterations, alpha, beta, evaporationRate, pheromoneDeposit);

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
            result.setSuccess(true);
        } catch (Exception e) {
            log.error("Błąd podczas wykonywania algorytmu ACO", e);
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        result.setExecutionDurationms(System.currentTimeMillis() - startTime);
        return result;
    }

    private Node findNodeById(Graph graph, Integer nodeId) {
        return graph.getNodes().stream()
                .filter(node -> nodeId.equals(node.getNodeId()))
                .findFirst()
                .orElse(null);
    }

    private AcoResult runACO(Graph graph, Node startNode, Node endNode, int antCount, int iterations,
                             double alpha, double beta, double evaporationRate, double pheromoneDeposit) {
        List<Node> nodes = new ArrayList<>(graph.getNodes());
        Map<String, Double> pheromones = initializePheromones(graph);

        List<String> bestPath = null;
        double bestDistance = Double.MAX_VALUE;
        int bestFoundAt = -1;

        for (int iter = 0; iter < iterations; iter++) {
            for (int ant = 0; ant < antCount; ant++) {
                List<String> path = constructPath(startNode, endNode, nodes, pheromones, alpha, beta);
                if (path != null && !path.isEmpty()) {
                    double distance = calculatePathDistance(path, graph);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestPath = new ArrayList<>(path);
                        bestFoundAt = iter;
                    }
                    updatePheromones(pheromones, path, distance, pheromoneDeposit);
                }
            }
            evaporatePheromones(pheromones, evaporationRate);
        }
        return new AcoResult(bestPath, bestDistance, bestFoundAt, pheromones);
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

    private List<String> constructPath(Node start, Node end, List<Node> nodes, Map<String, Double> pheromones, double alpha, double beta) {
        List<String> path = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();
        Node current = start;

        path.add(current.getNodeId().toString());
        visited.add(current.getNodeId());

        while(!current.equals(end) && path.size() < nodes.size()) {
            Node next = selectNextNode(current, visited, pheromones, alpha, beta);
            if (next == null) break;

            path.add(next.getNodeId().toString());
            visited.add(next.getNodeId());
            current = next;
        }
        return current.equals(end) ? path : null;
    }

    private Node selectNextNode(Node current, Set<Integer> visited, Map<String, Double> pheromones, double alpha, double beta) {
        List<Edge> availableEdges = current.getOutgoingEdges().stream()
                .filter(edge -> !visited.contains(edge.getTo().getNodeId()))
                .collect(Collectors.toList());

        if (availableEdges.isEmpty()) return null;

    double totalProbability = 0;
    Map<Edge, Double> probabilities = new HashMap<>();

    for (Edge edge: availableEdges) {
    String key = current.getNodeId() + "-" + edge.getTo().getNodeId();
    double pheromone = pheromones.getOrDefault(key, 1.0);
    double heuristic = 1.0 / (edge.getWeight() + 0.001);
    double probability = Math.pow(pheromone, alpha) * Math.pow(heuristic, beta);
    probabilities.put(edge, probability);
    }

    double random = Math.random() * totalProbability;
    double cumulative = 0;

    for (Map.Entry<Edge, Double> entry: probabilities.entrySet()) {
        cumulative += entry.getValue();
        if (random <= cumulative) {
            return entry.getKey().getTo();
        }
    }
    return availableEdges.get(0).getTo();
}

private double calculatePathDistance(List<String> path, Graph graph) {
        double distance = 0;
        for (int i = 0; i < path.size() - 1; i++) {
            Integer fromId = Integer.parseInt(path.get(i));
            Integer toId = Integer.parseInt(path.get(i+1));

            Edge edge = findEdge(graph, fromId, toId);
            if (edge != null) {
                distance += edge.getWeight();
            }
        }
        return distance;
}

private Edge findEdge(Graph graph, Integer fromId, Integer toId) {
        for (Node node: graph.getNodes()) {
            if (fromId.equals(node.getNodeId())) {
                return node.getOutgoingEdges().stream()
                        .filter(edge -> toId.equals(edge.getTo().getNodeId()))
                        .findFirst()
                        .orElse(null);
            }
        }
        return null;
}

private void updatePheromones(Map<String, Double> pheromones, List<String> path, double distance, double deposit) {
        double pheromonteToAdd = deposit / distance;
        for (int i = 0; i < path.size() - 1; i++) {
            String key = path.get(i) + "-" + path.get(i+1);
            pheromones.put(key, pheromones.getOrDefault(key, 1.00) + pheromonteToAdd);
        }
}

private void evaporatePheromones(Map<String, Double> pheromones, double evaporationRate) {
        pheromones.replaceAll((key, value) -> value * (1 - evaporationRate));
}

    private static class AcoResult {
        private final List<String> shortestPath;
        private final double shortestDistance;
        private final int iterationsToFind;
        private final Map<String, Double> finalPheromones;

        public AcoResult(List<String> shortestPath, double shortestDistance, int iterationsToFind, Map<String, Double> finalPheromones) {
            this.shortestPath = shortestPath;
            this.shortestDistance = shortestDistance;
            this.iterationsToFind = iterationsToFind;
            this.finalPheromones = finalPheromones;
        }

        public List<String> getShortestPath() { return shortestPath; }
        public double getShortestDistance() { return shortestDistance; }
        public int getIterationsToFind() { return iterationsToFind; }
        public Map<String, Double> getFinalPheromones() { return finalPheromones; }
    }

}

