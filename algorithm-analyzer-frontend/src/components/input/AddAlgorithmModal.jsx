import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { getAlgorithmTemplate, compileAlgorithm } from '../../api/customAlgorithmApi';
import ImplementationGuide from '../view/ImplementationGuide';
import '../../App.css'; // Stworzymy ten plik w kroku 6

const EXAMPLE_ALGORITHM_CODE = `import com.example.algorithm_analyzer.algorithms.AbstractAlgorithm
import com.example.algorithm_analyzer.problems.Problem
import com.example.algorithm_analyzer.dtos.IterationResult
import com.example.algorithm_analyzer.dtos.FinalMetricData
import com.example.algorithm_analyzer.dtos.ParameterDefinition
import com.example.algorithm_analyzer.enums.ParameterType

import java.util.Map
import java.util.List
import java.util.ArrayList
import java.util.Arrays
import java.util.Collections

public class RandomSearchAlgorithm extends AbstractAlgorithm {

    @Override
    public String getName() {
        return "Losowe Przeszukiwanie (Random Search)"
    }

    @Override
    public String getDescription() {
        return "Algorytm losowego przeszukiwania - generuje losowe rozwiązania i wybiera najlepsze."
    }

    @Override
    public List<ParameterDefinition> getParameterDefinitions() {
        return Arrays.asList(
            new ParameterDefinition(
                "iterations",
                "Liczba iteracji",
                ParameterType.INTEGER,
                500,
                10,
                10000,
                "Liczba losowych rozwiązań do wygenerowania",
                true
            )
        )
    }

    @Override
    protected Map<String, String> getSpecificMetricLabels() {
        return Map.of(
            "score_diff", "Różnica do najlepszego"
        )
    }

    @Override
    protected ExecutionResult solve(Problem problem, Map<String, Object> algorithmParameters) {
        int maxIterations = (Integer) algorithmParameters.getOrDefault("iterations", 500)
        boolean maximize = problem.isMaximization()

        List<String> bestSolution = problem.generateRandomSolution()
        double bestScore = problem.evaluateSolution(bestSolution)
        
        List<IterationResult> iterationResults = new ArrayList<>()
        int validSolutions = 1
        int improvements = 0

        for (int i = 0; i < maxIterations; i++) {
            List<String> candidateSolution = problem.generateRandomSolution()
            
            if (!problem.isValidSolution(candidateSolution)) {
                iterationResults.add(IterationResult.builder()
                    .iteration(i)
                    .bestScore(bestScore)
                    .currentScore(bestScore)
                    .bestSolution(new ArrayList<>(bestSolution))
                    .currentSolution(new ArrayList<>(bestSolution))
                    .specificMetrics(Map.of("score_diff", 0.0))
                    .build())
                continue
            }

            double candidateScore = problem.evaluateSolution(candidateSolution)
            validSolutions++
            
            boolean isBetter = maximize ? (candidateScore > bestScore) : (candidateScore < bestScore)
            
            if (isBetter) {
                bestSolution = new ArrayList<>(candidateSolution)
                bestScore = candidateScore
                improvements++
            }

            iterationResults.add(IterationResult.builder()
                .iteration(i)
                .bestScore(bestScore)
                .currentScore(candidateScore)
                .bestSolution(new ArrayList<>(bestSolution))
                .currentSolution(new ArrayList<>(candidateSolution))
                .specificMetrics(Map.of("score_diff", Math.abs(bestScore - candidateScore)))
                .build())
        }

        Map<String, FinalMetricData> finalMetrics = Map.of(
            "validSolutions", new FinalMetricData("Poprawne rozwiązania", (double) validSolutions),
            "improvements", new FinalMetricData("Liczba popraw", (double) improvements),
            "validRate", new FinalMetricData("Wskaźnik poprawności (%)", (double) validSolutions / maxIterations * 100.0)
        )

        return new ExecutionResult(bestSolution, bestScore, iterationResults, finalMetrics)
    }
}`;

/**
 * Modal do dodawania niestandardowego algorytmu.
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest widoczny
 * @param {function} props.onClose - Funkcja do zamknięcia modala
 * @param {function} props.onAlgorithmAdded - Funkcja wywoływana po sukcesie (aby odświeżyć listę)
 */
export default function AddAlgorithmModal({ isOpen, onClose, onAlgorithmAdded }) {
  const [code, setCode] = useState('');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showExample, setShowExample] = useState(false);

  // 1. Pobierz szablon, gdy modal się otwiera
  useEffect(() => {
    if (isOpen) {
      // Zresetuj stany
      setError(null);
      setSuccess(null);
      setCode('');
      setIsLoadingTemplate(true);

      getAlgorithmTemplate()
        .then((response) => {
          setCode(response.data);
        })
        .catch((err) => {
          console.error("Błąd pobierania szablonu:", err);
          setError("Nie można załadować szablonu. Sprawdź konsolę.");
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    }
  }, [isOpen]); // Uruchom tylko, gdy 'isOpen' się zmieni

  // 2. Obsługa wysłania kodu do kompilacji
  const handleSubmit = () => {
    setIsCompiling(true);
    setError(null);
    setSuccess(null);

    compileAlgorithm(code)
      .then((response) => {
        setSuccess('Algorytm dodany pomyślnie! Odświeżanie listy...');

        // Wywołaj funkcję zwrotną przekazaną z App.js
        onAlgorithmAdded();

        // Zamknij modal po 2 sekundach
        setTimeout(() => {
          onClose();
        }, 2000);
      })
      .catch((err) => {
        console.error("Błąd kompilacji:", err);
        // Backend powinien zwrócić błąd w formacie { "error": "..." }
        const apiError = err.response?.data?.error || "Nieznany błąd kompilacji.";
        setError(apiError);
      })
      .finally(() => {
        setIsCompiling(false);
      });
  };

  // 3. Renderowanie
  if (!isOpen) return null;

  // Użyj 'body.dark' do dynamicznej zmiany motywu edytora
  const editorTheme = document.body.classList.contains('dark') ? 'dark' : 'light';

  return (
    <div className="modal-overlay">
      {showGuide && (
        <ImplementationGuide 
          type="algorithm" 
          onClose={() => setShowGuide(false)} 
        />
      )}
      <div className="modal-content" style={showExample ? { maxWidth: '95vw', width: '95vw' } : {}}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2>Dodaj własny algorytm (Groovy/Java)</h2>
            <button 
              className="panel-button small-button" 
              onClick={() => setShowGuide(true)}
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
            >
              Jak zaimplementować?
            </button>
            <button 
              className="panel-button small-button" 
              onClick={() => setShowExample(!showExample)}
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
            >
              {showExample ? "Ukryj przykład" : "Pokaż przykład"}
            </button>
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="modal-body" style={showExample ? { display: 'flex', gap: '1rem' } : {}}>
          {isLoadingTemplate ? (
            <p>Ładowanie szablonu...</p>
          ) : (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {showExample && <h3>Twój kod</h3>}
                <CodeMirror
                  value={code}
                  height="50vh" // Ważne: ustaw wysokość edytora
                  extensions={[java()]} // Użyj podświetlania Javy
                  onChange={(value) => setCode(value)}
                  theme={editorTheme} // Dynamiczny motyw
                />
              </div>
              
              {showExample && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3>Przykład (Tylko do odczytu)</h3>
                  <CodeMirror 
                    value={EXAMPLE_ALGORITHM_CODE} 
                    readOnly={true} 
                    extensions={[java()]} 
                    theme={editorTheme}
                    height="50vh" 
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <div className="modal-messages">
            {error && <span className="error-message">{error}</span>}
            {success && <span className="success-message">{success}</span>}
          </div>
          <button
            className="panel-button"
            onClick={handleSubmit}
            disabled={isCompiling}
          >
            {isCompiling ? 'Kompilowanie...' : 'Skompiluj i Zapisz'}
          </button>
        </div>
      </div>
    </div>
  );
}