import api from './graphApi';

export const getProblems = () => api.get("/problems");
export const getProblemByName = (name) => api.get(`/problems/${encodeURIComponent(name)}`);
