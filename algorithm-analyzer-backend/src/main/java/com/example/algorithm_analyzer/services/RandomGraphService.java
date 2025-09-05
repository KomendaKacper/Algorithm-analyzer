package com.example.algorithm_analyzer.services;

import com.example.algorithm_analyzer.dto.RandomGraphRequest;
import com.example.algorithm_analyzer.entity.Edge;
import com.example.algorithm_analyzer.entity.Graph;
import com.example.algorithm_analyzer.entity.Node;
import com.example.algorithm_analyzer.repositories.GraphRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class RandomGraphService {

    private final GraphRepository graphRepository;
    private final Random random = new Random();

    public Graph generateRandomGraph(RandomGraphRequest request) {
        Graph graph = new Graph();
        graph.setName(request.getName() != null ? request.getName() : "Graf losowy " + System.currentTimeMillis());
        graph.setDirected(request.isDirected());

        List<Node> nodes = new ArrayList<>();
        for (int i = 1; i <= request.getNodeCount(); i++) {
            Node node = new Node();
            node.setNodeId(i);
            node.setGraph(graph);
            nodes.add(node);
            graph.getNodes().add(node);
        }

        // Tworzenie krawędzi na podstawie prawdopodobieństwa
        for (int i = 0; i < nodes.size(); i++) {
            for (int j = 0; j < nodes.size(); j++) {
                if (i != j && random.nextDouble() < request.getEdgeProbability()) {
                    // Sprawdź czy krawędź już istnieje (dla grafów nieskierowanych)
                    if (!request.isDirected() && edgeExists(nodes.get(j), nodes.get(i))) {
                        continue;
                    }
                    createEdge(nodes.get(i), nodes.get(j), request);
                }
            }
        }

        return graphRepository.save(graph);
    }

    public Graph generateConnectedGraph(RandomGraphRequest request) {
        Graph graph = new Graph();
        graph.setName(request.getName() != null ? request.getName() : "Graf spójny " + System.currentTimeMillis());
        graph.setDirected(request.isDirected());

        // Tworzenie węzłów
        List<Node> nodes = new ArrayList<>();
        for (int i = 1; i <= request.getNodeCount(); i++) {
            Node node = new Node();
            node.setNodeId(i);
            node.setGraph(graph);
            nodes.add(node);
            graph.getNodes().add(node);
        }

        // Minimalne drzewo spinające, aby zapewnić spójność
        List<Integer> connected = new ArrayList<>();
        List<Integer> unconnected = new ArrayList<>();

        connected.add(0);
        for (int i = 1; i < nodes.size(); i++) {
            unconnected.add(i);
        }

        while (!unconnected.isEmpty()) {
            int unconnectedIndex = random.nextInt(unconnected.size());
            int unconnectedNode = unconnected.get(unconnectedIndex);
            int connectedNode = connected.get(random.nextInt(connected.size()));

            createEdge(nodes.get(connectedNode), nodes.get(unconnectedNode), request);

            connected.add(unconnectedNode);
            unconnected.remove(unconnectedIndex);
        }

        // Dodaj dodatkowe losowe krawędzie
        for (int i = 0; i < nodes.size(); i++) {
            for (int j = 0; j < nodes.size(); j++) {
                if (i != j && random.nextDouble() < request.getEdgeProbability() * 0.5) {
                    if (!request.isDirected() && edgeExists(nodes.get(j), nodes.get(i))) {
                        continue;
                    }
                    if (!edgeExists(nodes.get(i), nodes.get(j))) {
                        createEdge(nodes.get(i), nodes.get(j), request);
                    }
                }
            }
        }

        return graphRepository.save(graph);
    }

    private void createEdge(Node from, Node to, RandomGraphRequest request) {
        Edge edge = new Edge();
        edge.setFrom(from);
        edge.setTo(to);
        edge.setWeight(generateRandomWeight(request.getMinWeight(), request.getMaxWeight()));
        from.getOutgoingEdges().add(edge);

        // Jeśli graf nieskierowany, dodaj odwrotną krawędź
        if (!request.isDirected()) {
            Edge reverse = new Edge();
            reverse.setFrom(to);
            reverse.setTo(from);
            reverse.setWeight(edge.getWeight());
            to.getOutgoingEdges().add(reverse);

            System.out.println("Dodano krawędź: " + from.getNodeId() + " -> " + to.getNodeId() +
                    " oraz odwrotną " + to.getNodeId() + " -> " + from.getNodeId());
        } else {
            System.out.println("Dodano krawędź: " + from.getNodeId() + " -> " + to.getNodeId());
        }
    }

    private boolean edgeExists(Node from, Node to) {
        return from.getOutgoingEdges().stream()
                .anyMatch(edge -> edge.getTo().equals(to));
    }

    private double generateRandomWeight(double min, double max) {
        return min + (max - min) * random.nextDouble();
    }
}
