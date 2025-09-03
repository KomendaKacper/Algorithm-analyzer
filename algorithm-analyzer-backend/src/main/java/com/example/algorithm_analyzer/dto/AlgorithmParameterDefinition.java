package com.example.algorithm_analyzer.dto;

import com.example.algorithm_analyzer.enums.ParameterType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlgorithmParameterDefinition {
    private String name;
    private String displayName;
    private ParameterType type;
    private Object defaultValue;
    private Object minValue;
    private Object maxValue;
    private String description;
    private boolean required;
}
