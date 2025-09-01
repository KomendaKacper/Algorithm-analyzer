package com.example.algorithm_analyzer.dto;

import lombok.Data;

@Data
public class GraphGeneratorRequest {
    private String name;
    private int numNodes;
    private double density;
    private boolean directed;
    private double maxWeight;
}
