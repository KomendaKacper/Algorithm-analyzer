package com.example.algorithm_analyzer.services;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AlgorithmInfo;
import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.problems.Problem;
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

    /**
     * Wykonanie algorytmu dla problemu optymalizacyjnego
     */
    public AlgorithmResult executeAlgorithm(String algorithmName, Problem problem, Map<String, Object> parameters) {
        Optional<Algorithm> algorithm = getAlgorithmByName(algorithmName);
        if (algorithm.isPresent()) {
            // Dla problemów typu TSP graf może być wymagany, dla Knapsack null
            return algorithm.get().execute(null, parameters);
            // Wewnątrz problem.initialize(graph, parameters) problem sam sprawdzi, czy graf jest potrzebny
        } else {
            AlgorithmResult result = new AlgorithmResult();
            result.setSuccess(false);
            result.setErrorMessage("Algorytm nie został znaleziony: " + algorithmName);
            return result;
        }
    }
}
