import api from './apiClient';

/**
 * Pobiera szablon kodu Groovy dla nowego problemu.
 */
export const getProblemTemplate = () => {
  return api.get('/custom-problems/template', {
    transformResponse: (res) => res, // Zachowaj odpowiedź jako zwykły tekst
  });
};

/**
 * Wysyła kod Groovy problemu do kompilacji i rejestracji.
 * @param {string} code - Kod Groovy jako string.
 */
export const compileProblem = (code) => {
  return api.post('/custom-problems/compile', { code });
};