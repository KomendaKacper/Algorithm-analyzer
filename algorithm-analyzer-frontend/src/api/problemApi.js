// src/api/problemApi.js

import api from './apiClient';

export const getProblems = () => api.get("/problems");

export const getProblemByName = (name) => api.get(`/problems/${encodeURIComponent(name)}`);