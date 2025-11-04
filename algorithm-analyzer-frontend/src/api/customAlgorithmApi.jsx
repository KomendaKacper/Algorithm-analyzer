import api from './apiClient';

/**
 * Pobiera szablon kodu Groovy z backendu.
 */
export const getAlgorithmTemplate = () => {
  // Zwraca dane tekstowe, więc musimy poinformować axios,
  // aby nie próbował parsować tego jako JSON.
  return api.get('/custom-algorithms/template', {
    transformResponse: (res) => res, // Zachowaj odpowiedź jako zwykły tekst
  });
};

/**
 * Wysyła kod Groovy do kompilacji i rejestracji.
 * @param {string} code - Kod Groovy jako string.
 */
export const compileAlgorithm = (code) => {
  // Backend oczekuje obiektu w formacie { "code": "..." }
  return api.post('/custom-algorithms/compile', { code });
};