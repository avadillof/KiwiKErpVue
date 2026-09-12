import axios from 'axios';
import { backendUrl } from './backendUrl';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  config.url = backendUrl(config.url || '');
  return config;
});

export { api };
