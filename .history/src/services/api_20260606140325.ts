import axios from 'axios';

// Ajusta la baseURL a la dirección donde corre tu backend (Spring Boot)
const api = axios.create({
  baseURL: 'http://localhost:8080', // Cambia esto por tu puerto real
  headers: {
    'Content-Type': 'application/json'
  }
});

export { api };