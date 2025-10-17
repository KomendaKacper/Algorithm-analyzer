package com.example.algorithm_analyzer.services;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AlgorithmInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AlgorithmService {

    private final List<Algorithm> algorithms;

    @Autowired
    public AlgorithmService(List<Algorithm> algorithms) {
        this.algorithms = algorithms;
    }

    public List<AlgorithmInfo> getAllAlgorithms() {
        return algorithms.stream()
                .map(algorithm -> new AlgorithmInfo(
                        algorithm.getName(),
                        algorithm.getDescription(),
                        algorithm.getParameterDefinitions()
                ))
                .collect(Collectors.toList());
    }

    public Optional<Algorithm> getAlgorithmByName(String name) {
        return algorithms.stream()
                .filter(algorithm -> algorithm.getName().equalsIgnoreCase(name.trim())) // Lepsze porównywanie
                .findFirst();
    }
}