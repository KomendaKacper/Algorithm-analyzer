package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.problems.Problem;
import com.example.algorithm_analyzer.dto.ParameterDefinition;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final List<Problem> problems;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllProblems() {
        List<Map<String, Object>> problemList = problems.stream()
                .map(problem -> Map.of(
                        "name", (Object) problem.getName(),
                        "description", (Object) problem.getDescription()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(problemList);
    }

    @GetMapping("/{problemName}")
    public ResponseEntity<Map<String, Object>> getProblemByName(@PathVariable String problemName) {
        Optional<Problem> problemOpt = problems.stream()
                .filter(p -> p.getName().equalsIgnoreCase(problemName))
                .findFirst();

        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Problem problem = problemOpt.get();
        // zwracamy listę parametrów pobraną z instancji problemu
        List<ParameterDefinition> params = problem.getParameters();

        Map<String, Object> response = Map.of(
                "name", problem.getName(),
                "description", problem.getDescription(),
                "parameters", params
        );

        return ResponseEntity.ok(response);
    }
}
