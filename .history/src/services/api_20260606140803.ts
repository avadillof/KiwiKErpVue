import axios from 'axios';

// Usamos la variable de entorno aquí
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json'
  }
});

export { api };