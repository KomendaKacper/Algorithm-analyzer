package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.dto.AlgorithmInfo;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.entity.Graph;
import com.example.algorithm_analyzer.services.AlgorithmService;
import com.example.algorithm_analyzer.services.GraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/algorithms")
@RequiredArgsConstructor
public class AlgorithmController {

    private final AlgorithmService algorithmService;
    private final GraphService graphService;

    @GetMapping
    public ResponseEntity<List<AlgorithmInfo>> getAllAlgorithms() {
        return ResponseEntity.ok(algorithmService.getAllAlgorithms());
    }

    @PostMapping("/{algorithmName}/{problemName}/execute")
    public ResponseEntity<AlgorithmResult> executeAlgorithm(
            @PathVariable String algorithmName,
            @PathVariable String problemName,
            @RequestParam Long graphId,
            @RequestBody Map<String, Object> parameters) {

        Optional<Graph> graph = graphService.findById(graphId);
        if (graph.isEmpty()) {
            AlgorithmResult errorResult = new AlgorithmResult();
            errorResult.setSuccess(false);
            errorResult.setErrorMessage("Graf o ID " + graphId + " nie został znaleziony");
            return ResponseEntity.badRequest().body(errorResult);
        }

        // dodaj problemName do mapy parametrów,
        // żeby serwis/algorytm miał nadal do niego dostęp
        parameters.put("problemName", problemName);

        Map<String, Object> parsedParameters = parameters.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> {
                            Object value = entry.getValue();
                            String key = entry.getKey();
                            if ("startNodeId".equals(key) || "endNodeId".equals(key)
                                    || "antCount".equals(key) || "iterations".equals(key)) {
                                return value instanceof Number ? ((Number) value).intValue() : Integer.parseInt(value.toString());
                            }
                            if ("alpha".equals(key) || "beta".equals(key) || "evaporationRate".equals(key) || "pheromoneDeposit".equals(key)) {
                                return value instanceof Number ? ((Number) value).doubleValue() : Double.parseDouble(value.toString());
                            }
                            if ("someBooleanParam".equals(key)) {
                                return Boolean.parseBoolean(value.toString());
                            }
                            return value;
                        }
                ));

        AlgorithmResult result = algorithmService.executeAlgorithm(algorithmName, graph.get(), parsedParameters);
        return ResponseEntity.ok(result);
    }
}
