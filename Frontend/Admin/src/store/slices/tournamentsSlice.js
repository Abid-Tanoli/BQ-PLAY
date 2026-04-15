import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  tournaments: [],
  loading: false,
  error: null,
};

export const fetchTournaments = createAsyncThunk(
  "tournaments/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/tournaments");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch tournaments"
      );
    }
  }
);

const tournamentsSlice = createSlice({
  name: "tournaments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload?.tournaments || action.payload || [];
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tournamentsSlice.reducer;
