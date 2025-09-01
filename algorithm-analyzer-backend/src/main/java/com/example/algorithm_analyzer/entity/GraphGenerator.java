package com.example.algorithm_analyzer.entity;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class GraphGenerator {

    private static final Random random = new Random();

    public static Graph generateRandomGraph(String name, int numNodes, double density, boolean directed, double maxWeight) {
        Graph graph = new Graph();
        graph.setName(name);
        graph.setDirected(directed);

        // mapa pomocnicza: nodeId -> Node
        Map<Integer, Node> nodeMap = new HashMap<>();

        // dodaj węzły
        for (int i = 0; i < numNodes; i++) {
            Node node = new Node();
            node.setNodeId(i);
            node.setGraph(graph);
            graph.getNodes().add(node);
            nodeMap.put(i, node);
        }

        // dodaj krawędzie
        for (int i = 0; i < numNodes; i++) {
            for (int j = i + 1; j < numNodes; j++) {
                if (random.nextDouble() < density) {
                    double weight = 1 + random.nextDouble() * (maxWeight - 1);

                    Node from = nodeMap.get(i);
                    Node to = nodeMap.get(j);

                    // krawędź i -> j
                    Edge edge = new Edge();
                    edge.setFrom(from);
                    edge.setTo(to);
                    edge.setWeight(weight);
                    from.getOutgoingEdges().add(edge);

                    // jeśli graf nieskierowany, dodaj odwrotną krawędź j -> i
                    if (!directed) {
                        Edge reverse = new Edge();
                        reverse.setFrom(to);
                        reverse.setTo(from);
                        reverse.setWeight(weight);
                        to.getOutgoingEdges().add(reverse);
                    }
                }
            }
        }

        return graph;
    }
}
