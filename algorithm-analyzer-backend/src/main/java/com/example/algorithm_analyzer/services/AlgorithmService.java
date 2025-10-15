package com.example.algorithm_analyzer.services;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AlgorithmInfo;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.entity.Graph;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
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
                .filter(algorithm -> algorithm.getName().equals(name))
                .findFirst();
    }

    public AlgorithmResult executeAlgorithm(String algorithmName, Graph graph, Map<String, Object> parameters) {
        Optional<Algorithm> algorithm = getAlgorithmByName(algorithmName);
        if (algorithm.isPresent()) {
            return algorithm.get().execute(graph, parameters);
        } else {
            AlgorithmResult result = new AlgorithmResult();
            result.setSuccess(false);
            result.setErrorMessage("Algorytm nie został znaleziony: " + algorithmName);
            return result;
        }
    }
}
