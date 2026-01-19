// src/services/api.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, //
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}
