// src/api/knapsackApi.js

import api from './apiClient'; // Użyj swojego głównego klienta API

const API_BASE = '/problems/knapsack';

export const getPredefinedKnapsackInstances = () => {
  return api.get(`${API_BASE}/predefined`);
};

export const generateKnapsackInstance = (params) => {
  return api.post(`${API_BASE}/generate`, params);
};