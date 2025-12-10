package com.example.algorithm_analyzer.controllers;

import com.example.algorithm_analyzer.dtos.ProblemInfo;
import com.example.algorithm_analyzer.services.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    /**
     * Zwraca listę wszystkich problemów (wbudowanych + niestandardowych).
     */
    @GetMapping
    public ResponseEntity<List<ProblemInfo>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblemsInfo());
    }
}