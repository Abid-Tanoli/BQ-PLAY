import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  matches: [],
  loading: false,
  error: null,
};

export const fetchMatches = createAsyncThunk("matches/fetch", async (_, thunkAPI) => {
  try {
    const res = await api.get("/matches");
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

export const createMatch = createAsyncThunk("matches/create", async (payload, thunkAPI) => {
  try {
    const res = await api.post("/matches", payload);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMatches.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchMatches.fulfilled, (s, action) => { s.loading = false; s.matches = action.payload; });
    b.addCase(fetchMatches.rejected, (s, action) => { s.loading = false; s.error = action.payload?.message || action.payload || "Failed"; });

    b.addCase(createMatch.fulfilled, (s, action) => {
      s.matches.unshift(action.payload);
    });
  }
});

export default matchesSlice.reducer;