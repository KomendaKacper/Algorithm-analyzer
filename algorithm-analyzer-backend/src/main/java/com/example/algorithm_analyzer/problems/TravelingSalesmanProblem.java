package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.entity.Edge;
import com.example.algorithm_analyzer.entity.Node;
import com.example.algorithm_analyzer.enums.ParameterType;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class TravelingSalesmanProblem extends AbstractProblem {
    
    private Map<String, Node> nodeMap;
    private Map<String, Edge> edgeMap;
    private int graphSize;
    private String startNodeId;
    
    @Override
    public String getName() {
        return "Traveling Salesman Problem (TSP)";
    }
    
    @Override
    public String getDescription() {
        return "Problem komiwojażera - znalezienie najkrótszego cyklu przechodzącego przez wszystkie miasta";
    }
    
    @Override
    protected void performInitialization() {
        this.graphSize = graph.getNodes().size();
        
        // Tworzenie mapy węzłów dla szybkiego dostępu
        this.nodeMap = new HashMap<>();
        for (Node node : graph.getNodes()) {
            nodeMap.put(node.getNodeId().toString(), node);
        }
        
        // Tworzenie mapy krawędzi dla szybkiego dostępu
        this.edgeMap = new HashMap<>();
        for (Node node : graph.getNodes()) {
            for (Edge edge : node.getOutgoingEdges()) {
                String key = node.getNodeId() + "-" + edge.getTo().getNodeId();
                edgeMap.put(key, edge);
            }
        }
        
        // Wybór węzła startowego
        this.startNodeId = getParameter("startNodeId", null, String.class);
        if (startNodeId == null) {
            List<Node> nodes = new ArrayList<>(graph.getNodes());
            this.startNodeId = nodes.get(new Random().nextInt(nodes.size())).getNodeId().toString();
        }
    }
    
    @Override
    public double evaluateSolution(List<String> solution) {
        if (!isValidSolution(solution)) {
            return Double.MAX_VALUE;
        }
        
        double totalDistance = 0;
        for (int i = 0; i < solution.size() - 1; i++) {
            String from = solution.get(i);
            String to = solution.get(i + 1);
            Edge edge = edgeMap.get(from + "-" + to);
            
            if (edge == null) {
                return Double.MAX_VALUE;
            }
            totalDistance += edge.getWeight();
        }
        
        return totalDistance;
    }
    
    @Override
    public boolean isValidSolution(List<String> solution) {
        if (solution == null || solution.size() != graphSize + 1) {
            return false;
        }
        
        // Sprawdź czy zaczyna i kończy się w tym samym węźle
        if (!solution.get(0).equals(solution.get(solution.size() - 1))) {
            return false;
        }
        
        // Sprawdź czy odwiedza wszystkie węzły dokładnie raz (poza startem/końcem)
        Set<String> visited = new HashSet<>(solution.subList(0, solution.size() - 1));
        if (visited.size() != graphSize) {
            return false;
        }
        
        // Sprawdź czy wszystkie przejścia są możliwe
        for (int i = 0; i < solution.size() - 1; i++) {
            String key = solution.get(i) + "-" + solution.get(i + 1);
            if (!edgeMap.containsKey(key)) {
                return false;
            }
        }
        
        return true;
    }
    
    @Override
    public double getHeuristicValue(String current, String next) {
        String key = current + "-" + next;
        Edge edge = edgeMap.get(key);
        if (edge == null) {
            return 0.001;
        }
        return 1.0 / (edge.getWeight() + 0.001);
    }
    
    @Override
    public List<String> getPossibleNextElements(String current, List<String> alreadySelected) {
        Node currentNode = nodeMap.get(current);
        if (currentNode == null) {
            return new ArrayList<>();
        }
        
        Set<String> visitedSet = new HashSet<>(alreadySelected);
        
        // Jeśli odwiedziliśmy wszystkie węzły, możemy wrócić tylko do startu
        if (visitedSet.size() == graphSize) {
            String key = current + "-" + startNodeId;
            if (edgeMap.containsKey(key)) {
                return Collections.singletonList(startNodeId);
            }
            return new ArrayList<>();
        }
        
        // W przeciwnym razie zwróć nieodwiedzone węzły
        return currentNode.getOutgoingEdges().stream()
                .map(edge -> edge.getTo().getNodeId().toString())
                .filter(nodeId -> !visitedSet.contains(nodeId))
                .collect(Collectors.toList());
    }
    
    @Override
    public String getStartElement() {
        return startNodeId;
    }
    
    @Override
    public boolean isSolutionComplete(List<String> solution) {
        return solution.size() == graphSize + 1 && 
               solution.get(0).equals(solution.get(solution.size() - 1));
    }
    
    @Override
    public List<String> getAllElements() {
        return new ArrayList<>(nodeMap.keySet());
    }
    
    @Override
    public String getPheromoneKey(String from, String to) {
        return from + "-" + to;
    }

    @Override
    public List<ParameterDefinition> getParameters() {
        return List.of(
                new ParameterDefinition(
                        "startNodeId",
                        "Węzeł startowy",
                        ParameterType.NODE_ID,
                        startNodeId,
                        null,
                        null,
                        "Węzeł, od którego rozpoczyna się trasa. Jeśli nie podano, wybierany jest losowo.",
                        false
                )
        );
    }

}