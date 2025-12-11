import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import '../../App.css';

const ABSTRACT_ALGORITHM_CODE = `package com.example.algorithm_analyzer.algorithms;

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

const ABSTRACT_PROBLEM_CODE = `package com.example.algorithm_analyzer.problems;

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

const PROBLEM_INTERFACE_CODE = `public interface Problem {
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

export default function ImplementationGuide({ type, onClose }) {
  const isAlgorithm = type === 'algorithm';
  const [activeTab, setActiveTab] = useState('guide'); // 'guide', 'abstraction', 'interface'

  const editorTheme = document.body.classList.contains('dark') ? 'dark' : 'light';

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content guide-modal" style={{ width: '800px', maxWidth: '95vw' }}>
        <div className="modal-header">
          <h2>{isAlgorithm ? "Przewodnik: Implementacja Algorytmu" : "Przewodnik: Implementacja Problemu"}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        
        <div className="tabs-header" style={{ padding: '0 20px', borderBottom: '1px solid var(--border-color)' }}>
            <button 
                className={`tab-button ${activeTab === 'guide' ? 'active' : ''}`}
                onClick={() => setActiveTab('guide')}
            >
                Przewodnik
            </button>
            <button 
                className={`tab-button ${activeTab === 'abstraction' ? 'active' : ''}`}
                onClick={() => setActiveTab('abstraction')}
            >
                {isAlgorithm ? 'AbstractAlgorithm.java' : 'AbstractProblem.java'}
            </button>
            {!isAlgorithm && (
                <button 
                    className={`tab-button ${activeTab === 'interface' ? 'active' : ''}`}
                    onClick={() => setActiveTab('interface')}
                >
                    Problem.java (Interfejs)
                </button>
            )}
        </div>
        
        <div className="modal-body guide-content">
          {activeTab === 'guide' && (
            isAlgorithm ? (
            <>
              <h3>Wymagania dla Algorytmu</h3>
              <p>Twój algorytm musi być napisany w języku <strong>Groovy</strong> (składnia kompatybilna z Java) i spełniać następujące warunki:</p>
              
              <ol>
                <li>Musi rozszerzać klasę <code>AbstractAlgorithm</code>.</li>
                <li>Musi implementować metody:
                  <ul>
                    <li><code>getName()</code> - Unikalna nazwa algorytmu.</li>
                    <li><code>getDescription()</code> - Krótki opis działania.</li>
                    <li><code>getParameterDefinitions()</code> - Lista parametrów konfigurowalnych w UI.</li>
                    <li><code>solve(Problem problem, Map params)</code> - Główna logika algorytmu.</li>
                  </ul>
                </li>
              </ol>

              <h3>Kluczowe Metody Problemu</h3>
              <p>Wewnątrz metody <code>solve</code> korzystaj z interfejsu <code>Problem</code>:</p>
              <ul>
                <li><code>problem.generateRandomSolution()</code> - Zwraca losowe rozwiązanie startowe.</li>
                <li><code>problem.generateNeighborSolution(solution)</code> - Zwraca sąsiada danego rozwiązania.</li>
                <li><code>problem.evaluateSolution(solution)</code> - Oblicza wynik (score) rozwiązania.</li>
                <li><code>problem.isValidSolution(solution)</code> - Sprawdza poprawność rozwiązania.</li>
                <li><code>problem.isMaximization()</code> - Zwraca <code>true</code> jeśli celem jest maksymalizacja wyniku.</li>
              </ul>

              <h3>Zwracanie Wyników</h3>
              <p>Metoda <code>solve</code> musi zwrócić obiekt <code>ExecutionResult</code> zawierający:</p>
              <ul>
                <li>Najlepsze znalezione rozwiązanie.</li>
                <li>Najlepszy wynik.</li>
                <li>Listę obiektów <code>IterationResult</code> (historia przebiegu).</li>
                <li>Mapę metryk końcowych (opcjonalnie).</li>
              </ul>
            </>
          ) : (
            <>
              <h3>Wymagania dla Problemu</h3>
              <p>Twój problem musi być napisany w języku <strong>Groovy</strong> i spełniać następujące warunki:</p>
              
              <ol>
                <li>Musi rozszerzać klasę <code>AbstractProblem</code>.</li>
                <li>Musi implementować metody informacyjne:
                  <ul>
                    <li><code>getName()</code>, <code>getDescription()</code></li>
                    <li><code>isMaximization()</code> - Czy maksymalizujemy wynik?</li>
                  </ul>
                </li>
                <li>Musi implementować logikę:
                  <ul>
                    <li><code>getParameters()</code> - Definicja parametrów (np. rozmiar problemu).</li>
                    <li><code>initialize(Map params)</code> - Inicjalizacja na podstawie parametrów.</li>
                    <li><code>evaluateSolution(List&lt;String&gt; solution)</code> - Funkcja celu.</li>
                    <li><code>isValidSolution(List&lt;String&gt; solution)</code> - Walidacja.</li>
                  </ul>
                </li>
                <li>Musi implementować operatory dla algorytmów:
                  <ul>
                    <li><code>generateRandomSolution()</code> - Generowanie losowe.</li>
                    <li><code>generateNeighborSolution(solution)</code> - Generowanie sąsiada (mutacja).</li>
                  </ul>
                </li>
              </ol>

              <h3>Reprezentacja Rozwiązania</h3>
              <p>Rozwiązanie jest zawsze listą ciągów znaków: <code>List&lt;String&gt;</code>.</p>
              <ul>
                <li>Dla problemów binarnych (np. Plecakowy): <code>["0", "1", "0", ...]</code></li>
                <li>Dla permutacji (np. TSP): <code>["Warszawa", "Kraków", "Gdańsk", ...]</code></li>
                <li>Dla ciągłych (np. Funkcja Sfery): <code>["3.14", "-1.5", "0.0", ...]</code></li>
              </ul>
            </>
          ))}

          {activeTab === 'abstraction' && (
            <div style={{ marginTop: '1rem' }}>
                <p>Poniżej znajduje się kod klasy bazowej, którą rozszerzasz. Zawiera ona metody pomocnicze i strukturę, której musisz przestrzegać.</p>
                <CodeMirror 
                    value={isAlgorithm ? ABSTRACT_ALGORITHM_CODE : ABSTRACT_PROBLEM_CODE} 
                    readOnly={true} 
                    extensions={[java()]} 
                    theme={editorTheme}
                    height="60vh" 
                />
            </div>
          )}

          {activeTab === 'interface' && !isAlgorithm && (
            <div style={{ marginTop: '1rem' }}>
                <p>To jest interfejs, który implementuje <code>AbstractProblem</code>. Twoja klasa musi dostarczyć implementację dla metod abstrakcyjnych.</p>
                <CodeMirror 
                    value={PROBLEM_INTERFACE_CODE} 
                    readOnly={true} 
                    extensions={[java()]} 
                    theme={editorTheme}
                    height="60vh" 
                />
            </div>
          )}
          
          <div className="guide-footer">
            <p><strong>Wskazówka:</strong> Skorzystaj z załadowanego szablonu jako punktu wyjścia!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
