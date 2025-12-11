import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {java} from '@codemirror/lang-java';
import { getProblemTemplate, compileProblem } from '../../api/customProblemApi';
import { ProblemGuideText, ABSTRACT_PROBLEM_CODE, PROBLEM_INTERFACE_CODE } from './GuideContent';
// Użyjemy tych samych stylów co AddAlgorithmModal
// import './AddAlgorithmModal.css'; 

const EXAMPLE_PROBLEM_CODE = `import com.example.algorithm_analyzer.problems.AbstractProblem
import com.example.algorithm_analyzer.dtos.ParameterDefinition
import com.example.algorithm_analyzer.enums.ParameterType

import java.util.Map
import java.util.List
import java.util.ArrayList
import java.util.Arrays
import java.util.Random
import java.util.Collections
import java.util.HashMap

public class NumberPartitioningProblem extends AbstractProblem {

    private List<String> elements = new ArrayList<>()
    private Map<String, Integer> values = new HashMap<>()
    private Random random = new Random()

    @Override
    public String getName() { return "Problem Podziału Liczb (Number Partitioning)" }

    @Override
    public String getDescription() { 
        return "Problem podziału zbioru liczb na dwa podzbiory o jak najbardziej zbliżonych sumach." 
    }

    @Override
    public boolean isMaximization() { return false }

    @Override
    public List<ParameterDefinition> getParameters() {
        return Arrays.asList(
            new ParameterDefinition("numbers", "Liczby", ParameterType.INTEGER, 
                10, 5, 50, "Liczba elementów do podziału", true)
        )
    }

    private int totalSum = 0

    @Override
    public void initialize(Map<String, Object> parameters) {
        int count = getParameter(parameters, "numbers", 10)
        
        this.elements.clear()
        this.values.clear()
        this.totalSum = 0
        
        for (int i = 0; i < count; i++) {
            String elem = "N" + i
            int val = random.nextInt(100) + 1
            this.elements.add(elem)
            this.values.put(elem, val)
            this.totalSum += val
        }
        
        this.initialized = true
    }

    @Override
    public double evaluateSolution(List<String> solution) {
        checkInitialized()
        int sum1 = solution.stream().mapToInt(e -> values.getOrDefault(e, 0)).sum()
        // Sum2 to reszta
        int sum2 = totalSum - sum1
        return Math.abs(sum1 - sum2)
    }

    @Override
    public boolean isValidSolution(List<String> solution) {
        return solution != null && solution.size() <= elements.size()
    }

    @Override
    public List<String> getAllElements() { return new ArrayList<>(elements) }

    @Override
    public List<String> generateRandomSolution() {
        checkInitialized()
        List<String> solution = new ArrayList<>(elements)
        Collections.shuffle(solution, random)
        return solution.subList(0, random.nextInt(solution.size() + 1))
    }

    @Override
    public List<String> generateNeighborSolution(List<String> currentSolution) {
        checkInitialized()
        List<String> neighbor = new ArrayList<>(currentSolution)
        
        if (random.nextBoolean() && !neighbor.isEmpty()) {
            neighbor.remove(random.nextInt(neighbor.size()))
        } else {
            List<String> candidates = new ArrayList<>(elements)
            candidates.removeAll(neighbor)
            if (!candidates.isEmpty()) {
                neighbor.add(candidates.get(random.nextInt(candidates.size())))
            }
        }
        
        return neighbor
    }

    @Override
    public List<String> convertPathToSolution(List<String> path) { return path }

    @Override
    public String getStartElement() { return null }

    @Override
    public List<String> getPossibleNextElements(String current, List<String> path) {
        // ACO: Zwracamy elementy, które nie są jeszcze w zbiorze A
        // Ograniczamy wybór, aby nie przekroczyć połowy sumy (heurystyka konstrukcyjna)
        int currentSum = path.stream().mapToInt(e -> values.getOrDefault(e, 0)).sum()
        int target = totalSum / 2
        
        if (currentSum >= target) return new ArrayList<>() // Stop if we reached half
        
        List<String> candidates = new ArrayList<>(elements)
        candidates.removeAll(path)
        return candidates
    }

    @Override
    public boolean isSolutionComplete(List<String> path) {
        // ACO: Rozwiązanie jest kompletne, gdy osiągnęliśmy cel (połowę sumy) lub brak elementów
        int currentSum = path.stream().mapToInt(e -> values.getOrDefault(e, 0)).sum()
        return currentSum >= (totalSum / 2) || getPossibleNextElements(null, path).isEmpty()
    }

    @Override
    public double getHeuristicValue(String current, String next) { return 1.0 }

    @Override
    public Map<String, Object> getProblemData() { return Map.of("values", this.values) }
}`;

/**
 * Modal do dodawania niestandardowego problemu.
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest widoczny
 * @param {function} props.onClose - Funkcja do zamknięcia modala
 * @param {function} props.onProblemAdded - Funkcja wywoływana po sukcesie (aby odświeżyć listę)
 */
export default function AddProblemModal({ isOpen, onClose, onProblemAdded }) {
  const [code, setCode] = useState('');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [rightPanelTab, setRightPanelTab] = useState('guide'); // null, 'example', 'guide', 'abstraction', 'interface'

  // 1. Pobierz szablon, gdy modal się otwiera
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      setRightPanelTab('guide');
      setCode('');
      setIsLoadingTemplate(true);

      getProblemTemplate()
        .then((response) => {
          setCode(response.data);
        })
        .catch((err) => {
          console.error("Błąd pobierania szablonu problemu:", err);
          setError("Nie można załadować szablonu. Sprawdź konsolę.");
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    }
  }, [isOpen]);

  // 2. Obsługa wysłania kodu do kompilacji
  const handleSubmit = () => {
    setIsCompiling(true);
    setError(null);
    setSuccess(null);

    compileProblem(code)
      .then((response) => {
        setSuccess('Problem dodany pomyślnie! Odświeżanie listy...');
        onProblemAdded(); // Wywołaj callback z App.js
        setTimeout(() => {
          onClose();
        }, 2000);
      })
      .catch((err) => {
        console.error("Błąd kompilacji problemu:", err);
        const apiError = err.response?.data?.error || "Nieznany błąd kompilacji.";
        setError(apiError);
      })
      .finally(() => {
        setIsCompiling(false);
      });
  };

  // 3. Renderowanie
  if (!isOpen) return null;

  const editorTheme = document.body.classList.contains('dark') ? 'dark' : 'light';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={rightPanelTab ? { maxWidth: '95vw', width: '95vw' } : {}}>
        <div className="modal-header">
            <h2>Dodaj własny problem (Groovy/Java)</h2>
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
                <button 
                  className={`panel-button small-button ${rightPanelTab === 'interface' ? 'active' : ''}`}
                  onClick={() => setRightPanelTab(rightPanelTab === 'interface' ? null : 'interface')}
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  Interfejs
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
                  height="50vh"
                  extensions={[java()]}
                  onChange={(value) => setCode(value)}
                  theme={editorTheme}
                />
              </div>

              {rightPanelTab && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <h3>
                    {rightPanelTab === 'example' && "Przykład (Tylko do odczytu)"}
                    {rightPanelTab === 'guide' && "Przewodnik"}
                    {rightPanelTab === 'abstraction' && "Klasa Bazowa (AbstractProblem)"}
                    {rightPanelTab === 'interface' && "Interfejs (Problem)"}
                  </h3>
                  
                  {rightPanelTab === 'example' && (
                    <CodeMirror 
                        value={EXAMPLE_PROBLEM_CODE} 
                        readOnly={true} 
                        extensions={[java()]} 
                        theme={editorTheme}
                        height="50vh" 
                    />
                  )}

                  {rightPanelTab === 'guide' && (
                    <div className="guide-scroll" style={{ height: '50vh', overflowY: 'auto', padding: '0 10px' }}>
                        <ProblemGuideText />
                    </div>
                  )}

                  {rightPanelTab === 'abstraction' && (
                    <CodeMirror 
                        value={ABSTRACT_PROBLEM_CODE} 
                        readOnly={true} 
                        extensions={[java()]} 
                        theme={editorTheme}
                        height="50vh" 
                    />
                  )}

                  {rightPanelTab === 'interface' && (
                    <CodeMirror 
                        value={PROBLEM_INTERFACE_CODE} 
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