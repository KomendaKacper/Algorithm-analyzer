import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { getAlgorithmTemplate, compileAlgorithm } from '../../api/customAlgorithmApi';
import { AlgorithmGuideText, ABSTRACT_ALGORITHM_CODE } from './GuideContent';
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
  const [rightPanelTab, setRightPanelTab] = useState('guide'); // null, 'example', 'guide', 'abstraction'

  // 1. Pobierz szablon, gdy modal się otwiera
  useEffect(() => {
    if (isOpen) {
      // Zresetuj stany
      setError(null);
      setSuccess(null);
      setRightPanelTab('guide');
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
      <div className="modal-content" style={rightPanelTab ? { maxWidth: '95vw', width: '95vw' } : {}}>
        <div className="modal-header">
            <h2>Dodaj własny algorytm (Groovy/Java)</h2>
            <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="modal-toolbar" style={{ 
            padding: '10px 20px', 
            borderBottom: '1px solid var(--color-border)', 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-secondary)'
        }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Pomoc i Narzędzia:</span>
            <div className="button-group" style={{ display: 'flex', gap: '5px' }}>
                <button 
                  className={`panel-button small-button ${rightPanelTab === 'guide' ? 'active' : ''}`}
                  onClick={() => setRightPanelTab(rightPanelTab === 'guide' ? null : 'guide')}
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  Przewodnik
                </button>
                <button 
                  className={`panel-button small-button ${rightPanelTab === 'example' ? 'active' : ''}`}
                  onClick={() => setRightPanelTab(rightPanelTab === 'example' ? null : 'example')}
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  Przykład
                </button>
                <button 
                  className={`panel-button small-button ${rightPanelTab === 'abstraction' ? 'active' : ''}`}
                  onClick={() => setRightPanelTab(rightPanelTab === 'abstraction' ? null : 'abstraction')}
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  Abstrakcja
                </button>
            </div>
        </div>

        <div className="modal-body" style={rightPanelTab ? { display: 'flex', gap: '1rem' } : {}}>
          {isLoadingTemplate ? (
            <p>Ładowanie szablonu...</p>
          ) : (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {rightPanelTab && <h3>Twój kod</h3>}
                <CodeMirror
                  value={code}
                  height="50vh" // Ważne: ustaw wysokość edytora
                  extensions={[java()]} // Użyj podświetlania Javy
                  onChange={(value) => setCode(value)}
                  theme={editorTheme} // Dynamiczny motyw
                />
              </div>
              
              {rightPanelTab && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <h3>
                    {rightPanelTab === 'example' && "Przykład (Tylko do odczytu)"}
                    {rightPanelTab === 'guide' && "Przewodnik"}
                    {rightPanelTab === 'abstraction' && "Klasa Bazowa (AbstractAlgorithm)"}
                  </h3>
                  
                  {rightPanelTab === 'example' && (
                    <CodeMirror 
                        value={EXAMPLE_ALGORITHM_CODE} 
                        readOnly={true} 
                        extensions={[java()]} 
                        theme={editorTheme}
                        height="50vh" 
                    />
                  )}

                  {rightPanelTab === 'guide' && (
                    <div className="guide-scroll" style={{ height: '50vh', overflowY: 'auto', padding: '0 10px' }}>
                        <AlgorithmGuideText />
                    </div>
                  )}

                  {rightPanelTab === 'abstraction' && (
                    <CodeMirror 
                        value={ABSTRACT_ALGORITHM_CODE} 
                        readOnly={true} 
                        extensions={[java()]} 
                        theme={editorTheme}
                        height="50vh" 
                    />
                  )}
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