// Plik: com/example/algorithm_analyzer/services/AlgorithmService.java

package com.example.algorithm_analyzer.services;

import com.example.algorithm_analyzer.algorithms.Algorithm;
import com.example.algorithm_analyzer.dto.AlgorithmInfo; // <-- WAŻNY IMPORT
import groovy.lang.GroovyClassLoader;
import lombok.extern.slf4j.Slf4j;
import org.codehaus.groovy.control.CompilerConfiguration;
import org.codehaus.groovy.control.MultipleCompilationErrorsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException; // <-- WAŻNY IMPORT
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class AlgorithmService {

    private final Map<String, Algorithm> builtInAlgorithms;
    private final Map<String, Algorithm> customAlgorithms = new ConcurrentHashMap<>();
    private final CompilerConfiguration groovyCompilerConfig;

    @Autowired
    public AlgorithmService(List<Algorithm> builtInAlgorithms, CompilerConfiguration groovyCompilerConfig) {
        this.builtInAlgorithms = builtInAlgorithms.stream()
                .collect(Collectors.toConcurrentMap(Algorithm::getName, Function.identity()));
        this.groovyCompilerConfig = groovyCompilerConfig;
        log.info("Loaded {} built-in algorithms: {}", builtInAlgorithms.size(), this.builtInAlgorithms.keySet());
    }

    public void registerCustomAlgorithm(String groovyCode) throws Exception {
        Class<?> dynamicClass;
        try (GroovyClassLoader loader = new GroovyClassLoader(this.getClass().getClassLoader(), groovyCompilerConfig)) {
            dynamicClass = loader.parseClass(groovyCode);
        } catch (MultipleCompilationErrorsException e) {
            log.warn("User algorithm compilation failed: {}", e.getMessage());
            throw e;
        } catch (IOException e) {
            log.error("I/O error while parsing Groovy class", e);
            throw new Exception("Server error while loading class.", e);
        }

        if (!Algorithm.class.isAssignableFrom(dynamicClass)) {
            throw new IllegalArgumentException("The provided code does not implement the 'Algorithm' interface.");
        }

        Algorithm newAlgorithm = (Algorithm) dynamicClass.getDeclaredConstructor().newInstance();
        String algorithmName = newAlgorithm.getName();

        if (algorithmName == null || algorithmName.isBlank()) {
            throw new IllegalArgumentException("Algorithm name (from getName()) cannot be blank.");
        }

        if (builtInAlgorithms.containsKey(algorithmName)) {
            throw new IllegalArgumentException("Algorithm name '" + algorithmName + "' conflicts with a built-in algorithm.");
        }

        customAlgorithms.put(algorithmName, newAlgorithm);
        log.info("Successfully registered new custom algorithm: {}", algorithmName);
    }

    /**
     * Zwraca algorytm (wbudowany lub niestandardowy) o danej nazwie.
     * ZMIANA: Zmieniono nazwę z getAlgorithm na getAlgorithmByName
     * ZMIANA: Rzuca wyjątek NoSuchElementException
     */
    public Algorithm getAlgorithmByName(String name) {
        Algorithm algo = customAlgorithms.get(name); // Najpierw szukaj w niestandardowych
        if (algo == null) {
            algo = builtInAlgorithms.get(name); // Potem w wbudowanych
        }
        if (algo == null) {
            throw new NoSuchElementException("Algorithm not found: " + name);
        }
        return algo;
    }

    /**
     * Zwraca listę WSZYSTKICH algorytmów (dla UI) jako DTO.
     * NOWA METODA: Zastępuje starą getAllAlgorithmNames()
     */
    public List<AlgorithmInfo> getAllAlgorithmsInfo() {
        // Połącz obie mapy algorytmów w jeden strumień
        return Stream.concat(
                        builtInAlgorithms.values().stream(),
                        customAlgorithms.values().stream()
                )
                .map(algo -> new AlgorithmInfo(
                        algo.getName(),
                        algo.getDescription(),
                        algo.getParameterDefinitions()
                )) // Konwertuj każdą instancję na DTO
                .sorted((a1, a2) -> a1.getName().compareToIgnoreCase(a2.getName())) // Sortuj alfabetycznie
                .collect(Collectors.toList());
    }
}