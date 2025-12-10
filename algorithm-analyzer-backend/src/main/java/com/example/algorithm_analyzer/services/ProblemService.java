package com.example.algorithm_analyzer.services;

import com.example.algorithm_analyzer.dto.ProblemInfo;
import com.example.algorithm_analyzer.problems.Problem;
import groovy.lang.GroovyClassLoader;
import lombok.extern.slf4j.Slf4j;
import org.codehaus.groovy.control.CompilerConfiguration;
import org.codehaus.groovy.control.MultipleCompilationErrorsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class ProblemService {

    // Mapa wbudowanych problemów (załadowanych przez Spring)
    private final Map<String, Problem> builtInProblems;

    // Mapa problemów dodanych przez użytkownika
    private final Map<String, Problem> customProblems = new ConcurrentHashMap<>();

    private final CompilerConfiguration groovyCompilerConfig;

    @Autowired
    public ProblemService(List<Problem> builtInProblems, CompilerConfiguration groovyCompilerConfig) {
        this.groovyCompilerConfig = groovyCompilerConfig;
        // Załaduj wszystkie beany Springa implementujące 'Problem'
        this.builtInProblems = builtInProblems.stream()
                .collect(Collectors.toConcurrentMap(Problem::getName, Function.identity()));
        log.info("Loaded {} built-in problems: {}", builtInProblems.size(), this.builtInProblems.keySet());
    }

    /**
     * Kompiluje i rejestruje nowy problem na podstawie kodu Groovy.
     */
    public void registerCustomProblem(String groovyCode) throws Exception {
        Class<?> dynamicClass;
        try (GroovyClassLoader loader = new GroovyClassLoader(this.getClass().getClassLoader(), groovyCompilerConfig)) {
            dynamicClass = loader.parseClass(groovyCode);
        } catch (MultipleCompilationErrorsException e) {
            log.warn("User problem compilation failed: {}", e.getMessage());
            throw e;
        } catch (IOException e) {
            log.error("I/O error while parsing Groovy class", e);
            throw new Exception("Server error while loading class.", e);
        }

        if (!Problem.class.isAssignableFrom(dynamicClass)) {
            throw new IllegalArgumentException("The provided code does not implement the 'Problem' interface.");
        }

        Problem newProblem = (Problem) dynamicClass.getDeclaredConstructor().newInstance();
        String problemName = newProblem.getName();

        if (problemName == null || problemName.isBlank()) {
            throw new IllegalArgumentException("Problem name (from getName()) cannot be blank.");
        }
        if (builtInProblems.containsKey(problemName) || customProblems.containsKey(problemName)) {
            throw new IllegalArgumentException("Problem name '" + problemName + "' conflicts with an existing problem.");
        }

        customProblems.put(problemName, newProblem);
        log.info("Successfully registered new custom problem: {}", problemName);
    }

    /**
     * Pobiera instancję problemu (wbudowanego lub niestandardowego) po nazwie.
     */
    public Problem getProblemByName(String name) {
        Problem problem = customProblems.get(name); // Najpierw sprawdź niestandardowe
        if (problem == null) {
            problem = builtInProblems.get(name); // Potem wbudowane
        }
        if (problem == null) {
            // Rzuć ten sam wyjątek, co stary ProblemService
            throw new NoSuchElementException("Problem not found: " + name);
        }
        return problem;
    }

    /**
     * Zwraca listę DTO dla WSZYSTKICH problemów (dla UI).
     */
    public List<ProblemInfo> getAllProblemsInfo() {
        return Stream.concat(
                        builtInProblems.values().stream(),
                        customProblems.values().stream()
                )
                .map(problem -> new ProblemInfo(
                        problem.getName(),
                        problem.getDescription(),
                        problem.getParameters()
                ))
                .sorted((p1, p2) -> p1.getName().compareToIgnoreCase(p2.getName()))
                .collect(Collectors.toList());
    }
}