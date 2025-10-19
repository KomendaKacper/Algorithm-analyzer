package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dto.AlgorithmResult;
import com.example.algorithm_analyzer.dto.IterationResult;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
public abstract class AbstractAlgorithm implements Algorithm {

    /**
     * Wzorzec projektowy "metoda szablonowa".
     * Ta metoda `execute` jest finalna i zawiera całą logikę wspólną:
     * - Mierzenie czasu
     * - Inicjalizację problemu
     * - Obsługę błędów
     * - Budowanie obiektu AlgorithmResult
     * Deleguje ona faktyczne rozwiązanie problemu do abstrakcyjnej metody `solve`.
     */
    @Override
    public final AlgorithmResult execute(Problem problem, Map<String, Object> problemParameters, Map<String, Object> algorithmParameters) {
        long startTime = System.currentTimeMillis();
        AlgorithmResult result = new AlgorithmResult();
        result.setAlgorithmName(this.getName());
        result.setProblemName(problem.getName());

        try {
            problem.initialize(problemParameters);

            // Wywołanie właściwej logiki algorytmu w klasie dziedziczącej
            ExecutionResult executionResult = solve(problem, algorithmParameters);

            result.setSuccess(true);
            result.setBestSolution(executionResult.bestSolution(), executionResult.bestScore());
            result.setIterationResults(new ArrayList<>(executionResult.iterationResults()));
            result.setNodes(problem.getAllElements());
            result.setFinalMetrics(executionResult.finalMetrics());
            result.setSpecificMetricLabels(getSpecificMetricLabels());

        } catch (Exception e) {
            log.error("Błąd podczas wykonywania algorytmu '{}'", this.getName(), e);
            result.setError(e.getMessage());
            result.setSuccess(false);
        }

        result.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        return result;
    }

    /**
     * Każda konkretna implementacja algorytmu musi zaimplementować tę metodę.
     * Zawiera ona "czyste" serce algorytmu.
     * @param problem Zainicjalizowana instancja problemu.
     * @param algorithmParameters Mapa z parametrami dla tego algorytmu.
     * @return Obiekt `ExecutionResult` zawierający wyniki.
     */
    protected abstract ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters);

    /**
     * Opcjonalna metoda do zdefiniowania etykiet dla specyficznych metryk,
     * które mają być wizualizowane na froncie.
     * @return Mapa kluczy metryk i ich etykiet.
     */
    protected Map<String, String> getSpecificMetricLabels() {
        return Map.of(); // Domyślnie pusta
    }

    /**
     * Rekord używany do ustandaryzowania danych zwracanych przez metodę `solve`.
     */
    protected record ExecutionResult(
            List<String> bestSolution,
            double bestScore,
            List<IterationResult> iterationResults,
            Map<String, Object> finalMetrics
    ) {
        // Konstruktor dla algorytmów bez finalnych metryk macierzowych
        public ExecutionResult(List<String> bestSolution, double bestScore, List<IterationResult> iterationResults) {
            this(bestSolution, bestScore, iterationResults, Map.of());
        }
    }
}
