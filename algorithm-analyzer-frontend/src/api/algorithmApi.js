import api from './graphApi';

export const getAlgorithms = () => api.get("/algorithms");
export const getAlgorithmCategories = () => api.get("/algorithms/categories");
export const executeAlgorithm = (algorithmName, graphId, parameters) => 
  api.post(`/algorithms/${encodeURIComponent(algorithmName)}/execute?graphId=${graphId}`, parameters);
