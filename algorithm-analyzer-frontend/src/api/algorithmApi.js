import api from './graphApi';

export const getAlgorithms = () => api.get("/algorithms");

export const getAlgorithmCategories = () => api.get("/algorithms/categories");

/**
 * Wykonuje algorytm dla danego problemu i grafu.
 * @param {string} algorithmName - nazwa algorytmu (np. "Ant Colony Optimization (ACO)")
 * @param {string} problemName - nazwa problemu (np. "Traveling Salesman Problem (TSP)")
 * @param {number} graphId - ID grafu
 * @param {object} parameters - parametry algorytmu
 */
export const executeAlgorithm = (algorithmName, problemName, graphId, parameters) => {
  const encodedAlgo = encodeURIComponent(algorithmName);
  const encodedProblem = encodeURIComponent(problemName);

  return api.post(
    `/algorithms/${encodedAlgo}/${encodedProblem}/execute?graphId=${graphId}`,
    parameters
  );
};
