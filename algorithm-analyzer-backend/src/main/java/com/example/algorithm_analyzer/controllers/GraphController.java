package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.dto.GraphDTO;
import com.example.algorithm_analyzer.dto.GraphGeneratorRequest;
import com.example.algorithm_analyzer.services.GraphService;
import org.springframework.web.bind.annotation.*;
import java.util.Collection;

@RestController
@RequestMapping("/graphs")
public class GraphController {

    private final GraphService graphService;

    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping
    public Collection<GraphDTO> getGraphs() {
        return graphService.getAllGraphs();
    }

    @PostMapping
    public GraphDTO uploadGraph(@RequestBody GraphDTO graphDTO) {
        return graphService.uploadGraph(graphDTO);
    }

    @PostMapping("/random")
    public GraphDTO generateRandomGraph(@RequestBody GraphGeneratorRequest request) {
        return graphService.generateRandomGraph(request);
    }
}

