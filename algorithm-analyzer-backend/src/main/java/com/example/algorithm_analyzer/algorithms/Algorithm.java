package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.problems.Problem;

import java.util.List;
import java.util.Map;

public interface Algorithm {
    String getName();
    String getDescription();
    List<ParameterDefinition> getParameterDefinitions();
    AlgorithmResult execute(Problem problem, Map<String, Object> parameters);
}
