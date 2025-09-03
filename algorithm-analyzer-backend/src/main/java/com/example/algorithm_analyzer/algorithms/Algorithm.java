package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.AlgorithmParameterDefinition;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.entity.Graph;

import java.util.List;
import java.util.Map;

public interface Algorithm {
    String getName();
    String getDescription();
    List<AlgorithmParameterDefinition> getParameterDefinitions();
    AlgorithmResult execute(Graph graph, Map<String, Object> parameters);
    String getCategory();
}
