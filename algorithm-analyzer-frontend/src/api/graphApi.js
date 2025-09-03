import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const getGraphs = () => api.get("/graphs");

export const getGraph = (id) => api.get(`/graphs/${id}`);

export const getGraphNodes = (id) => api.get(`/graphs/${id}/nodes`);

export const getGraphEdges = (id) => api.get(`/graphs/${id}/edges`);
export const generateRandomGraph = (params) => api.post("/graphs/random", params);

export const getAlgorithms = () => api.get("/algorithms");
export const executeAlgorithm = (algorithmName, graphId, parameters) => 
  api.post(`/algorithms/${encodeURIComponent(algorithmName)}/execute?graphId=${graphId}`, parameters);

export default api;