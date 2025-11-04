import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {java} from '@codemirror/lang-java';
import { getProblemTemplate, compileProblem } from '../../api/customProblemApi';
// Użyjemy tych samych stylów co AddAlgorithmModal
// import './AddAlgorithmModal.css'; 

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

  // 1. Pobierz szablon, gdy modal się otwiera
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
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
      <div className="modal-content">
        <div className="modal-header">
          <h2>Dodaj własny problem (Groovy/Java)</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="modal-body">
          {isLoadingTemplate ? (
            <p>Ładowanie szablonu...</p>
          ) : (
            <CodeMirror
              value={code}
              height="50vh"
              extensions={[java()]}
              onChange={(value) => setCode(value)}
              theme={editorTheme}
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