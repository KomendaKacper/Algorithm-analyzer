package com.example.algorithm_analyzer.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinalMetricData {
    private String label;
    private Object data;
}
