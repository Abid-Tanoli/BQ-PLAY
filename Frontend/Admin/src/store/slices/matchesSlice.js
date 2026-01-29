import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  matches: [],
  currentMatch: null,
  loading: false,
  error: null,
};

export const fetchMatches = createAsyncThunk(
  "matches/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/matches");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch matches"
      );
    }
  }
);

export const fetchMatchById = createAsyncThunk(
  "matches/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`/matches/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch match"
      );
    }
  }
);

export const createMatch = createAsyncThunk(
  "matches/create",
  async (payload, thunkAPI) => {
    try {
      const res = await api.post("/matches", payload);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create match"
      );
    }
  }
);

export const updateMatch = createAsyncThunk(
  "matches/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.put(`/matches/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update match"
      );
    }
  }
);

export const deleteMatch = createAsyncThunk(
  "matches/delete",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/matches/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete match"
      );
    }
  }
);

export const updateScore = createAsyncThunk(
  "matches/updateScore",
  async ({ matchId, inningsIndex, runs, wickets, balls, extras, commentaryText }, thunkAPI) => {
    try {
      const res = await api.post(`/matches/${matchId}/score`, {
        inningsIndex,
        runs,
        wickets,
        balls,
        extras,
        commentaryText,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update score"
      );
    }
  }
);

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    clearCurrentMatch(state) {
      state.currentMatch = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all matches
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.matches || [];
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single match
      .addCase(fetchMatchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMatch = action.payload;
      })
      .addCase(fetchMatchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create match
      .addCase(createMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.loading = false;
        const match = action.payload?.match || action.payload;
        if (match) {
          state.matches.unshift(match);
        }
      })
      .addCase(createMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update match
      .addCase(updateMatch.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
        }
      })
      // Delete match
      .addCase(deleteMatch.fulfilled, (state, action) => {
        state.matches = state.matches.filter((m) => m._id !== action.payload);
      })
      // Update score
      .addCase(updateScore.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated && state.currentMatch?._id === updated._id) {
          state.currentMatch = updated;
        }
        const index = state.matches.findIndex((m) => m._id === updated?._id);
        if (index !== -1 && updated) {
          state.matches[index] = updated;
        }
      });
  },
});

export const { clearCurrentMatch, clearError } = matchesSlice.actions;
export default matchesSlice.reducer;