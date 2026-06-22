import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  matches: [],
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

export const createMatch = createAsyncThunk(
  "matches/create",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/matches", data);
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

export const setPlayingXI = createAsyncThunk(
  "matches/setPlayingXI",
  async ({ matchId, teamId, players }, thunkAPI) => {
    try {
      const res = await api.put(`/matches/${matchId}/playing-xi`, { teamId, players });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to set playing XI"
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
        state.matches = action.payload?.matches || action.payload || [];
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        const match = action.payload?.match || action.payload;
        if (match) state.matches.push(match);
      })
      .addCase(updateMatch.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) state.matches[index] = updated;
        }
      })
      .addCase(deleteMatch.fulfilled, (state, action) => {
        state.matches = state.matches.filter((m) => m._id !== action.payload);
      });
  },
});

export default matchesSlice.reducer;
