package com.example.algorithm_analyzer.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProblemInfo {
    private String name;
    private String description;
    private List<ParameterDefinition> parameters;
}