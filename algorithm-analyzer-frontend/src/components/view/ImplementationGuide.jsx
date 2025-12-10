import React from 'react';
import '../../App.css';

export default function ImplementationGuide({ type, onClose }) {
  const isAlgorithm = type === 'algorithm';

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content guide-modal">
        <div className="modal-header">
          <h2>{isAlgorithm ? "Przewodnik: Implementacja Algorytmu" : "Przewodnik: Implementacja Problemu"}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        
        <div className="modal-body guide-content">
          {isAlgorithm ? (
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
          )}
          
          <div className="guide-footer">
            <p><strong>Wskazówka:</strong> Skorzystaj z załadowanego szablonu jako punktu wyjścia!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
