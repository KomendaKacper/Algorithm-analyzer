package com.example.algorithm_analyzer.dto;

import lombok.Data;

@Data
public class RandomGraphRequest {
    private String name;
    private int nodeCount;
    private double edgeProbability;
    private boolean directed;
    private double minWeight;
    private double maxWeight;
}