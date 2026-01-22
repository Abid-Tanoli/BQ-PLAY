import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  matches: [],
  loading: false,
  error: null,
};

export const fetchMatches = createAsyncThunk(
  "matches/fetch",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/admin/matches");
      return res.data; 
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

export const createMatch = createAsyncThunk(
  "matches/create",
  async (payload, thunkAPI) => {
    try {
      if (!payload?.title) throw new Error("Match title is required");
      const res = await api.post("/admin/matches", payload);
      return res.data.match;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: err.message }
      );
    }
  }
);

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload.matches; 
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch matches";
      })

      .addCase(createMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.matches.unshift(action.payload);
      })
      .addCase(createMatch.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to create match";
      });
  },
});

export default matchesSlice.reducer;
