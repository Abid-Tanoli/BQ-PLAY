import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchTournaments = createAsyncThunk(
  "tournaments/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/tournaments");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  }
);

export const createTournament = createAsyncThunk(
  "tournaments/create",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/tournaments", data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create");
    }
  }
);

const tournamentsSlice = createSlice({
  name: "tournaments",
  initialState: {
    tournaments: [],
    currentTournament: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.tournaments.unshift(action.payload.tournament || action.payload);
      });
  }
});

export const { clearError } = tournamentsSlice.actions;
export default tournamentsSlice.reducer;