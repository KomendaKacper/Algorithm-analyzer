import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // <-- dostosuj do Twojego backendu
});

export default api;
