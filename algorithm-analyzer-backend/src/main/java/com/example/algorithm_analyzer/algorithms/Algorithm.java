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

    /**
     * Zmieniona sygnatura metody execute.
     * @param problem Instancja problemu do rozwiązania.
     * @param problemParameters Mapa z parametrami specyficznymi dla problemu (np. cities, distances).
     * @param algorithmParameters Mapa z parametrami specyficznymi dla algorytmu (np. antCount, iterations).
     * @return Wynik działania algorytmu.
     */
    AlgorithmResult execute(Problem problem, Map<String, Object> problemParameters, Map<String, Object> algorithmParameters);
}