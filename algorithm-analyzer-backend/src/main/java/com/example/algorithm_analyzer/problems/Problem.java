package com.example.algorithm_analyzer.problems;

import com.example.algorithm_analyzer.dto.ParameterDefinition;
import com.example.algorithm_analyzer.entity.Graph;
import java.util.List;
import java.util.Map;

/**
 * Interfejs reprezentujący problem optymalizacyjny do rozwiązania przez algorytm
 */
public interface Problem {
    
    /**
     * Nazwa problemu (np. "Problem Komiwojażera", "Problem Plecakowy")
     */
    String getName();
    
    /**
     * Opis problemu
     */
    String getDescription();
    
    /**
     * Inicjalizacja problemu na podstawie grafu i parametrów
     */
    void initialize(Graph graph, Map<String, Object> parameters);
    
    /**
     * Oblicza jakość (fitness) rozwiązania - im mniejsza wartość, tym lepiej
     * (dla problemów minimalizacyjnych)
     */
    double evaluateSolution(List<String> solution);
    
    /**
     * Sprawdza czy rozwiązanie spełnia ograniczenia problemu
     */
    boolean isValidSolution(List<String> solution);
    
    /**
     * Zwraca heurystyczną wartość dla przejścia z elementu current do next
     * (np. odwrotność odległości dla TSP)
     */
    double getHeuristicValue(String current, String next);
    
    /**
     * Zwraca listę możliwych następnych elementów do wybrania
     */
    List<String> getPossibleNextElements(String current, List<String> alreadySelected);
    
    /**
     * Zwraca element startowy (jeśli problem tego wymaga)
     */
    String getStartElement();
    
    /**
     * Sprawdza czy rozwiązanie jest kompletne
     */
    boolean isSolutionComplete(List<String> solution);
    
    /**
     * Zwraca wszystkie możliwe elementy rozwiązania
     */
    List<String> getAllElements();
    
    /**
     * Generuje klucz dla macierzy feromonów między dwoma elementami
     */
    String getPheromoneKey(String from, String to);

    List<ParameterDefinition> getParameters();
}