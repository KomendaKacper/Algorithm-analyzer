package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.dto.RandomGraphRequest;
import com.example.algorithm_analyzer.entity.Graph;
import com.example.algorithm_analyzer.entity.Node;
import com.example.algorithm_analyzer.services.GraphService;
import com.example.algorithm_analyzer.services.RandomGraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/graphs")
@RequiredArgsConstructor
public class GraphController {

    private final GraphService graphService;
    private final RandomGraphService randomGraphService;

    @GetMapping
    public ResponseEntity<List<GraphSummary>> getAllGraphs() {
        List<Graph> graphs = graphService.findAll();

        List<GraphSummary> summaries = graphs.stream()
                .map(g -> new GraphSummary(
                        g.getId(),
                        g.getName(),
                        g.isDirected(),
                        g.getNodes().size(),
                        g.getNodes().stream().mapToInt(n -> n.getOutgoingEdges().size()).sum()
                ))
                .toList();

        return ResponseEntity.ok(summaries);
    }


    @GetMapping("/{id}")
    public ResponseEntity<GraphDetails> getGraph(@PathVariable Long id) {
        return graphService.findById(id)
                .map(graph -> ResponseEntity.ok(createGraphDetails(graph)))
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/{id}/nodes")
    public ResponseEntity<List<Integer>> getGraphNodes(@PathVariable Long id) {
        Optional<Graph> graph = graphService.findById(id);
        if (graph.isPresent()) {
            List<Integer> nodeIds = graph.get().getNodes().stream()
                    .map(Node::getNodeId)
                    .sorted()
                    .collect(Collectors.toList());
            return ResponseEntity.ok(nodeIds);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/edges")
    public ResponseEntity<List<EdgeInfo>> getGraphEdges(@PathVariable Long id) {
        Optional<Graph> graph = graphService.findById(id);
        if (graph.isPresent()) {
            List<EdgeInfo> edges = graph.get().getNodes().stream()
                    .flatMap(node -> node.getOutgoingEdges().stream())
                    .map(edge -> new EdgeInfo(
                            edge.getFrom().getNodeId(),
                            edge.getTo().getNodeId(),
                            edge.getWeight()
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(edges);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/random")
    public ResponseEntity<GraphDetails> generateRandomGraph(@RequestBody RandomGraphRequest request) {
        try {
            // Walidacja parametrów
            if (request.getNodeCount() < 2 || request.getNodeCount() > 100) {
                throw new IllegalArgumentException("Liczba węzłów musi być między 2 a 100");
            }
            if (request.getEdgeProbability() < 0 || request.getEdgeProbability() > 1) {
                throw new IllegalArgumentException("Prawdopodobieństwo krawędzi musi być między 0 a 1");
            }
            if (request.getMinWeight() >= request.getMaxWeight()) {
                throw new IllegalArgumentException("Minimalna waga musi być mniejsza od maksymalnej");
            }

            Graph graph = randomGraphService.generateConnectedGraph(request);
            GraphDetails details = createGraphDetails(graph);
            return ResponseEntity.ok(details);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @PostMapping("/random-simple")
    public ResponseEntity<GraphDetails> generateSimpleRandomGraph(@RequestBody RandomGraphRequest request) {
        try {
            Graph graph = randomGraphService.generateRandomGraph(request);
            GraphDetails details = createGraphDetails(graph);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    // DTO classes
    public static class GraphSummary {
        public Long id;
        public String name;
        public boolean directed;
        public int nodeCount;
        public int edgeCount;

        public GraphSummary(Long id, String name, boolean directed, int nodeCount, int edgeCount) {
            this.id = id;
            this.name = name;
            this.directed = directed;
            this.nodeCount = nodeCount;
            this.edgeCount = edgeCount;
        }
    }

    public static class GraphDetails {
        public Long id;
        public String name;
        public boolean directed;
        public List<NodeInfo> nodes;
        public List<EdgeInfo> edges;

        public GraphDetails(Long id, String name, boolean directed, List<NodeInfo> nodes, List<EdgeInfo> edges) {
            this.id = id;
            this.name = name;
            this.directed = directed;
            this.nodes = nodes;
            this.edges = edges;
        }
    }

    public static class NodeInfo {
        public Integer nodeId;
        public int outgoingEdgesCount;

        public NodeInfo(Integer nodeId, int outgoingEdgesCount) {
            this.nodeId = nodeId;
            this.outgoingEdgesCount = outgoingEdgesCount;
        }
    }

    public static class EdgeInfo {
        public Integer from;
        public Integer to;
        public double weight;

        public EdgeInfo(Integer from, Integer to, double weight) {
            this.from = from;
            this.to = to;
            this.weight = weight;
        }
    }

    private GraphSummary createGraphSummary(Graph graph) {
        int edgeCount = graph.getNodes().stream()
                .mapToInt(node -> node.getOutgoingEdges().size())
                .sum();
        
        return new GraphSummary(
                graph.getId(),
                graph.getName(),
                graph.isDirected(),
                graph.getNodes().size(),
                edgeCount
        );
    }

    private GraphDetails createGraphDetails(Graph graph) {
        List<NodeInfo> nodes = graph.getNodes().stream()
                .map(node -> new NodeInfo(node.getNodeId(), node.getOutgoingEdges().size()))
                .sorted((n1, n2) -> Integer.compare(n1.nodeId, n2.nodeId))
                .collect(Collectors.toList());

        List<EdgeInfo> edges = graph.getNodes().stream()
                .flatMap(node -> node.getOutgoingEdges().stream())
                .map(edge -> new EdgeInfo(
                        edge.getFrom().getNodeId(),
                        edge.getTo().getNodeId(),
                        edge.getWeight()
                ))
                .sorted((e1, e2) -> {
                    int cmp = Integer.compare(e1.from, e2.from);
                    return cmp != 0 ? cmp : Integer.compare(e1.to, e2.to);
                })
                .collect(Collectors.toList());

        return new GraphDetails(
                graph.getId(),
                graph.getName(),
                graph.isDirected(),
                nodes,
                edges
        );
    }
}