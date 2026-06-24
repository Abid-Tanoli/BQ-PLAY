import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { clearAdminSession } from "../../services/authSession";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("bq_user")) || null;
  } catch {
    clearAdminSession("");
    return null;
  }
}

const initialState = {
  user: readStoredUser(),
  token: localStorage.getItem("token") || localStorage.getItem("bq_token") || null,
  loading: false,
  error: null,
};

function persistToken(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("bq_token", token);
  localStorage.setItem("bq_user", JSON.stringify(user));
}

function clearAllAuth() {
  clearAdminSession("");
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await api.post("/admin/login", { email, password });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }, thunkAPI) => {
    try {
      const res = await api.post("/admin/register", { name, email, password });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      clearAllAuth();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload.admin || action.payload.user || null;
        state.user = userData;
        state.token = action.payload.token;
        if (action.payload.token) {
          persistToken(action.payload.token, userData);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload.admin || action.payload.user || null;
        state.user = userData;
        state.token = action.payload.token;
        if (action.payload.token) {
          persistToken(action.payload.token, userData);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
