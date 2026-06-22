import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: (() => {
    try { return JSON.parse(localStorage.getItem('bq_user')); }
    catch { return null; }
  })(),
  token: localStorage.getItem('bq_token') || localStorage.getItem('token') || null,
  status: 'idle',
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user || null;
      state.token = action.payload.token || null;
      if (action.payload.token) {
        localStorage.setItem('bq_token', action.payload.token);
        localStorage.setItem('token', action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem('bq_user', JSON.stringify(action.payload.user));
      }
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('bq_token');
      localStorage.removeItem('token');
      localStorage.removeItem('bq_user');
    },
    setError(state, action) {
      state.error = action.payload;
    }
  }
});

export const { setCredentials, clearAuth, setError } = authSlice.actions;
export default authSlice.reducer;