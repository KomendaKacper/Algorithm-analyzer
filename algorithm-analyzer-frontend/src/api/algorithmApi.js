import api from './apiClient';

export const getAlgorithms = () => api.get("/algorithms");

export const executeComparison = (problemName, payload) => {
  const url = `/compare/${encodeURIComponent(problemName)}/execute`;
  console.log("Wysyłanie zapytania porównawczego na:", url);
  console.log("Payload (jako JSON):", JSON.stringify(payload, null, 2)); 
  return api.post(url, payload);
};