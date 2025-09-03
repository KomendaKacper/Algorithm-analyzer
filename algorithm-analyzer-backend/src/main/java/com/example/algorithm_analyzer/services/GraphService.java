package com.example.algorithm_analyzer.services;

import com.example.algorithm_analyzer.dto.EdgeDTO;
import com.example.algorithm_analyzer.dto.GraphDTO;
import com.example.algorithm_analyzer.dto.RandomGraphRequest;
import com.example.algorithm_analyzer.entity.Edge;
import com.example.algorithm_analyzer.entity.Graph;
import com.example.algorithm_analyzer.entity.GraphGenerator;
import com.example.algorithm_analyzer.entity.Node;
import com.example.algorithm_analyzer.repositories.GraphRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GraphService {
    private final GraphRepository graphRepository;
    public GraphService(GraphRepository graphRepository) {
        this.graphRepository = graphRepository;
    }
    public Collection<GraphDTO> getAllGraphs() {
        return graphRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public GraphDTO uploadGraph(GraphDTO graphDTO) {
        Graph graph = new Graph();
        graph.setName(graphDTO.getName());
        graph.setDirected(graphDTO.isDirected());

        Map<Integer, Node> nodeMap = new HashMap<>();

        // dodaj węzły
        for (Integer nodeId : graphDTO.getNodes()) {
            Node node = new Node();
            node.setNodeId(nodeId);
            node.setGraph(graph);
            graph.getNodes().add(node);
            nodeMap.put(nodeId, node);
        }

        // dodaj krawędzie
        for (Map.Entry<Integer, List<EdgeDTO>> entry : graphDTO.getEdges().entrySet()) {
            Node fromNode = nodeMap.get(entry.getKey());
            for (EdgeDTO edgeDTO : entry.getValue()) {
                Node toNode = nodeMap.get(edgeDTO.getTarget());

                Edge edge = new Edge();
                edge.setFrom(fromNode);
                edge.setTo(toNode);
                edge.setWeight(edgeDTO.getWeight());

                fromNode.getOutgoingEdges().add(edge);
            }
        }

        Graph saved = graphRepository.save(graph);
        return toDTO(saved);
    }

    @Transactional
    public GraphDTO generateRandomGraph(RandomGraphRequest request) {
        Graph graph = GraphGenerator.generateRandomGraph(
                request.getName(),
                request.getNodeCount(),
                request.getEdgeProbability(),
                request.isDirected(),
                request.getMaxWeight()
        );

        Graph saved = graphRepository.save(graph);
        return toDTO(saved);
    }

    private GraphDTO toDTO(Graph graph) {
        GraphDTO dto = new GraphDTO();
        dto.setId(graph.getId());
        dto.setName(graph.getName());
        dto.setDirected(graph.isDirected());

        Set<Integer> nodes = graph.getNodes().stream()
                .map(Node::getNodeId)
                .collect(Collectors.toSet());
        dto.setNodes(nodes);

        Map<Integer, List<EdgeDTO>> edges = new HashMap<>();
        for (Node node : graph.getNodes()) {
            List<EdgeDTO> edgeList = node.getOutgoingEdges().stream()
                    .map(e -> new EdgeDTO(e.getTo().getNodeId(), e.getWeight()))
                    .toList();
            edges.put(node.getNodeId(), edgeList);
        }
        dto.setEdges(edges);

        return dto;
    }

    public Optional<Graph> findById(Long id) {
        return graphRepository.findById(id);
    }

    public List<Graph> findAll() {
        return graphRepository.findAll();
    }

    public Graph save(Graph graph) {
        return graphRepository.save(graph);
    }
}
