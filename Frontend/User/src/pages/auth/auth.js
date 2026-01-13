import { api, setAuthToken } from '../../services/api';

function persistAuth(token, user) {
  if (token) {
    localStorage.setItem('bq_token', token);
    setAuthToken(token);
  }
  if (user) localStorage.setItem('bq_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('bq_token');
  localStorage.removeItem('bq_user');
  setAuthToken(null);
}

export async function login(email, password) {
  const res = await api.post('/users/login', { email, password });
  const { token, user } = res.data;
  persistAuth(token, user);
  return user;
}

export async function register(name, email, password) {
  const res = await api.post('/users/register', { name, email, password });
  return await login(email, password);
}

export function logout() {
  clearAuth();
}

export function getStoredUser() {
  const raw = localStorage.getItem('bq_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

export function initAuthFromStorage() {
  const token = localStorage.getItem('bq_token');
  if (token) setAuthToken(token);
  return getStoredUser();
}