package com.example.algorithm_analyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GraphDTO {
    private Long id;
    private String name;
    private boolean directed;
    private Set<Integer> nodes;
    private Map<Integer, List<EdgeDTO>> edges;
}

