import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const getGraphs = () => api.get("/graphs");
export const generateRandomGraph = (params) => api.post("/graphs/random", params);

