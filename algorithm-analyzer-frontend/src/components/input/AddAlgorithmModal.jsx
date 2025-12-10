import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { getAlgorithmTemplate, compileAlgorithm } from '../../api/customAlgorithmApi';
import ImplementationGuide from '../view/ImplementationGuide';
import '../../App.css'; // Stworzymy ten plik w kroku 6

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
      <div className="modal-content">
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
          </div>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="modal-body">
          {isLoadingTemplate ? (
            <p>Ładowanie szablonu...</p>
          ) : (
            <CodeMirror
              value={code}
              height="50vh" // Ważne: ustaw wysokość edytora
              extensions={[java()]} // Użyj podświetlania Javy
              onChange={(value) => setCode(value)}
              theme={editorTheme} // Dynamiczny motyw
            />
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