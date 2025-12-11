import React from 'react';

export const ABSTRACT_ALGORITHM_CODE = `package com.example.algorithm_analyzer.algorithms;

import com.example.algorithm_analyzer.dtos.AlgorithmResult;
import com.example.algorithm_analyzer.dtos.FinalMetricData;
import com.example.algorithm_analyzer.dtos.IterationResult;
import com.example.algorithm_analyzer.problems.Problem;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@Slf4j
public abstract class AbstractAlgorithm implements Algorithm {

    public static final int DEFAULT_TIMEOUT_SECONDS = 30;

    @Override
    public final AlgorithmResult execute(Problem problem, Map<String, Object> problemParameters, Map<String, Object> algorithmParameters) {
        // ... (logika uruchamiania, obsługi czasu i wątków) ...
        // Ta metoda wywołuje Twoją metodę solve()
    }

    /**
     * To jest metoda, którą musisz zaimplementować.
     */
    protected abstract ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters);

    protected Map<String, String> getSpecificMetricLabels() {
        return new LinkedHashMap<>();
    }

    // Rekord wyniku, który musisz zwrócić
    protected record ExecutionResult(
            List<String> bestSolution,
            double bestScore,
            List<IterationResult> iterationResults,
            Map<String, FinalMetricData> finalMetrics
    ) {
        public ExecutionResult(List<String> bestSolution, double bestScore, List<IterationResult> iterationResults) {
            this(bestSolution, bestScore, iterationResults, Map.of());
        }
    }
}`;

export const ABSTRACT_PROBLEM_CODE = `package com.example.algorithm_analyzer.problems;

import java.util.List;
import java.util.Map;

public abstract class AbstractProblem implements Problem {

    protected boolean initialized = false;

    // Sprawdza czy wywołano initialize()
    protected void checkInitialized() {
        if (!initialized) {
            throw new IllegalStateException("Problem not initialized!");
        }
    }

    // Metody pomocnicze do konwersji parametrów
    protected Map<String, Integer> convertToIntegerMap(Map<?, ?> map) { ... }
    protected Map<String, Double> convertToDoubleMap(Map<?, ?> map) { ... }
    protected List<String> convertToStringList(List<?> list) { ... }
    
    protected <T> T getParameter(Map<String, Object> parameters, String key, T defaultValue) {
        // Bezpieczne pobieranie parametru z rzutowaniem
    }

    @Override
    public String getPheromoneKey(String from, String to) {
        return (from != null ? from : "START") + "->" + to;
    }

    @Override
    public boolean isMaximization() {
        return false; // Domyślnie minimalizacja
    }
}`;

export const PROBLEM_INTERFACE_CODE = `public interface Problem {
    // Metody informacyjne
    String getName();
    String getDescription();
    boolean isMaximization();
    List<ParameterDefinition> getParameters();

    // Inicjalizacja
    void initialize(Map<String, Object> parameters);

    // Ocena i walidacja
    double evaluateSolution(List<String> solution);
    boolean isValidSolution(List<String> solution);

    // Dla algorytmów lokalnego przeszukiwania (SA, TS)
    List<String> generateRandomSolution();
    List<String> generateNeighborSolution(List<String> currentSolution);

    // Dla algorytmów konstrukcyjnych (ACO)
    List<String> getAllElements();
    List<String> getPossibleNextElements(String current, List<String> visited);
    boolean isSolutionComplete(List<String> path);
    double getHeuristicValue(String from, String to);
    String getStartElement();
    String getPheromoneKey(String from, String to);
    List<String> convertPathToSolution(List<String> path);
    
    Map<String, Object> getProblemData();
}`;

const styles = {
  container: {
    lineHeight: '1.6',
    color: 'var(--text-color)',
  },
  header: {
    marginTop: '20px',
    marginBottom: '10px',
    color: 'var(--color-primary-static)',
    borderBottom: '1px solid var(--color-primary-static)',
    paddingBottom: '5px',
    fontSize: '1.2em',
    fontWeight: '600'
  },
  firstHeader: {
    marginTop: '0',
    marginBottom: '10px',
    color: 'var(--color-primary-static)',
    borderBottom: '1px solid var(--color-primary-static)',
    paddingBottom: '5px',
    fontSize: '1.2em',
    fontWeight: '600'
  },
  paragraph: {
    marginBottom: '10px'
  },
  list: {
    marginBottom: '20px',
    paddingLeft: '20px'
  },
  listItem: {
    marginBottom: '5px'
  },
  code: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)', // Orange tint
    color: 'var(--color-primary-static)',
    padding: '2px 4px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontWeight: '500'
  }
};

export const AlgorithmGuideText = () => (
  <div style={styles.container}>
    <h3 style={styles.firstHeader}>Nawigacja w tym oknie</h3>
    <p style={styles.paragraph}>Skorzystaj z przycisków powyżej, aby przełączać widok prawego panelu:</p>
    <ul style={styles.list}>
        <li style={styles.listItem}><strong>Przewodnik</strong> - Ten widok. Zawiera instrukcje implementacji.</li>
        <li style={styles.listItem}><strong>Przykład</strong> - Pokazuje przykładową implementację (Random Search). Możesz się na niej wzorować.</li>
        <li style={styles.listItem}><strong>Abstrakcja</strong> - Pokazuje kod klasy bazowej <code style={styles.code}>AbstractAlgorithm</code>, którą musisz rozszerzyć.</li>
    </ul>

    <h3 style={styles.header}>Wymagania dla Algorytmu</h3>
    <p style={styles.paragraph}>Twój algorytm musi być napisany w języku <strong>Groovy</strong> (składnia kompatybilna z Java) i spełniać następujące warunki:</p>
    
    <ol style={styles.list}>
      <li style={styles.listItem}>Musi rozszerzać klasę <code style={styles.code}>AbstractAlgorithm</code>.</li>
      <li style={styles.listItem}>Musi implementować metody:
        <ul style={{ marginTop: '5px' }}>
          <li><code style={styles.code}>getName()</code> - Unikalna nazwa algorytmu.</li>
          <li><code style={styles.code}>getDescription()</code> - Krótki opis działania.</li>
          <li><code style={styles.code}>getParameterDefinitions()</code> - Lista parametrów konfigurowalnych w UI.</li>
          <li><code style={styles.code}>solve(Problem problem, Map params)</code> - Główna logika algorytmu.</li>
        </ul>
      </li>
    </ol>

    <h3 style={styles.header}>Kluczowe Metody Problemu</h3>
    <p style={styles.paragraph}>Wewnątrz metody <code style={styles.code}>solve</code> korzystaj z interfejsu <code style={styles.code}>Problem</code>:</p>
    <ul style={styles.list}>
      <li style={styles.listItem}><code style={styles.code}>problem.generateRandomSolution()</code> - Zwraca losowe rozwiązanie startowe.</li>
      <li style={styles.listItem}><code style={styles.code}>problem.generateNeighborSolution(solution)</code> - Zwraca sąsiada danego rozwiązania.</li>
      <li style={styles.listItem}><code style={styles.code}>problem.evaluateSolution(solution)</code> - Oblicza wynik (score) rozwiązania.</li>
      <li style={styles.listItem}><code style={styles.code}>problem.isValidSolution(solution)</code> - Sprawdza poprawność rozwiązania.</li>
      <li style={styles.listItem}><code style={styles.code}>problem.isMaximization()</code> - Zwraca <code style={styles.code}>true</code> jeśli celem jest maksymalizacja wyniku.</li>
    </ul>

    <h3 style={styles.header}>Zwracanie Wyników</h3>
    <p style={styles.paragraph}>Metoda <code style={styles.code}>solve</code> musi zwrócić obiekt <code style={styles.code}>ExecutionResult</code> zawierający:</p>
    <ul style={styles.list}>
      <li style={styles.listItem}>Najlepsze znalezione rozwiązanie.</li>
      <li style={styles.listItem}>Najlepszy wynik.</li>
      <li style={styles.listItem}>Listę obiektów <code style={styles.code}>IterationResult</code> (historia przebiegu).</li>
      <li style={styles.listItem}>Mapę metryk końcowych (opcjonalnie).</li>
    </ul>
  </div>
);

export const ProblemGuideText = () => (
  <div style={styles.container}>
    <h3 style={styles.firstHeader}>Nawigacja w tym oknie</h3>
    <p style={styles.paragraph}>Skorzystaj z przycisków powyżej, aby przełączać widok prawego panelu:</p>
    <ul style={styles.list}>
        <li style={styles.listItem}><strong>Przewodnik</strong> - Ten widok. Zawiera instrukcje implementacji.</li>
        <li style={styles.listItem}><strong>Przykład</strong> - Pokazuje przykładową implementację (Number Partitioning).</li>
        <li style={styles.listItem}><strong>Abstrakcja</strong> - Pokazuje kod klasy bazowej <code style={styles.code}>AbstractProblem</code>.</li>
        <li style={styles.listItem}><strong>Interfejs</strong> - Pokazuje definicję interfejsu <code style={styles.code}>Problem</code>, który definiuje kontrakt dla wszystkich problemów.</li>
    </ul>

    <h3 style={styles.header}>Wymagania dla Problemu</h3>
    <p style={styles.paragraph}>Twój problem musi być napisany w języku <strong>Groovy</strong> i spełniać następujące warunki:</p>
    
    <ol style={styles.list}>
      <li style={styles.listItem}>Musi rozszerzać klasę <code style={styles.code}>AbstractProblem</code>.</li>
      <li style={styles.listItem}>Musi implementować metody informacyjne:
        <ul style={{ marginTop: '5px' }}>
          <li><code style={styles.code}>getName()</code>, <code style={styles.code}>getDescription()</code></li>
          <li><code style={styles.code}>isMaximization()</code> - Czy maksymalizujemy wynik?</li>
        </ul>
      </li>
      <li style={styles.listItem}>Musi implementować logikę:
        <ul style={{ marginTop: '5px' }}>
          <li><code style={styles.code}>getParameters()</code> - Definicja parametrów (np. rozmiar problemu).</li>
          <li><code style={styles.code}>initialize(Map params)</code> - Inicjalizacja na podstawie parametrów.</li>
          <li><code style={styles.code}>evaluateSolution(List&lt;String&gt; solution)</code> - Funkcja celu.</li>
          <li><code style={styles.code}>isValidSolution(List&lt;String&gt; solution)</code> - Walidacja.</li>
        </ul>
      </li>
      <li style={styles.listItem}>Musi implementować operatory dla algorytmów:
        <ul style={{ marginTop: '5px' }}>
          <li><code style={styles.code}>generateRandomSolution()</code> - Generowanie losowe.</li>
          <li><code style={styles.code}>generateNeighborSolution(solution)</code> - Generowanie sąsiada (mutacja).</li>
        </ul>
      </li>
    </ol>

    <h3 style={styles.header}>Reprezentacja Rozwiązania</h3>
    <p style={styles.paragraph}>Rozwiązanie jest zawsze listą ciągów znaków: <code style={styles.code}>List&lt;String&gt;</code>.</p>
    <ul style={styles.list}>
      <li style={styles.listItem}>Dla problemów binarnych (np. Plecakowy): <code style={styles.code}>["0", "1", "0", ...]</code></li>
      <li style={styles.listItem}>Dla permutacji (np. TSP): <code style={styles.code}>["Warszawa", "Kraków", "Gdańsk", ...]</code></li>
    </ul>
  </div>
);
