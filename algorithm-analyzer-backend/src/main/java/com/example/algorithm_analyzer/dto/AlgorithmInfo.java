package com.example.algorithm_analyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlgorithmInfo {
    private String name;
    private String description;
    private String category;
    private List<AlgorithmParameterDefinition> parameters;
}
