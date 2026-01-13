import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
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
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
    }
  }
});

export const { setCredentials, clearAuth, setError } = authSlice.actions;
export default authSlice.reducer;