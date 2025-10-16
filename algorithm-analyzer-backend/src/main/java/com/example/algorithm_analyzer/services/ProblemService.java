package com.example.algorithm_analyzer.services;

import com.example.algorithm_analyzer.problems.KnapsackProblem;
import com.example.algorithm_analyzer.problems.Problem;
import com.example.algorithm_analyzer.problems.TravelingSalesmanProblem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ProblemService {

    private final KnapsackProblem knapsackProblem;
    private final TravelingSalesmanProblem tspProblem;

    private final Map<String, Problem> problemRegistry = new HashMap<>();

    // Inicjalizacja mapy problemów
    public ProblemService(KnapsackProblem knapsackProblem,
                          TravelingSalesmanProblem tspProblem) {
        this.knapsackProblem = knapsackProblem;
        this.tspProblem = tspProblem;

        problemRegistry.put(knapsackProblem.getName(), knapsackProblem);
        problemRegistry.put(tspProblem.getName(), tspProblem);
    }

    /**
     * Pobiera instancję problemu po nazwie
     */
    public Problem getProblemByName(String name) {
        return problemRegistry.get(name);
    }

    /**
     * Rejestruje nowy problem dynamicznie (opcjonalne)
     */
    public void registerProblem(Problem problem) {
        problemRegistry.put(problem.getName(), problem);
    }
}
