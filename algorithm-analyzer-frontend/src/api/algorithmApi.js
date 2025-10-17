// src/api/algorithmApi.js

import api from './apiClient';

// Pobranie listy algorytmów
export const getAlgorithms = () => api.get("/algorithms");

/**
 * Główna funkcja do wykonywania dowolnego algorytmu dla dowolnego problemu.
 * @param {string} algorithmName - Pełna nazwa algorytmu, np. "Ant Colony Optimization (ACO)".
 * @param {string} problemName - Nazwa beana problemu, np. "travelingSalesmanProblem".
 * @param {object} payload - Obiekt zawierający problemParameters i algorithmParameters.
 */
export const executeAlgorithm = (algorithmName, problemName, payload) => {
  const url = `/algorithms/${encodeURIComponent(algorithmName)}/problems/${encodeURIComponent(problemName)}/execute`;
  console.log("Wysyłanie zapytania na:", url);
  console.log("Payload:", JSON.stringify(payload)); // Logujemy payload jako string, żeby zobaczyć całą strukturę
  return api.post(url, payload);
};