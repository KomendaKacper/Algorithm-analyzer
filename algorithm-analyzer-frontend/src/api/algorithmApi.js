import api from './apiClient';

// Pobranie listy algorytmów
export const getAlgorithms = () => api.get("/algorithms");

// Wykonanie ACO dla problemu
export const executeAco = (problemName, parameters) => {
  return api.post(`/algorithms/aco/${encodeURIComponent(problemName)}/execute`, parameters);
};
