import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  players: [],
  loading: false,
  error: null,
};

export const fetchPlayers = createAsyncThunk("players/fetch", async (_, thunkAPI) => {
  try {
    const res = await api.get("/players");
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

const playersSlice = createSlice({
  name: "players",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPlayers.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchPlayers.fulfilled, (s, action) => { s.loading = false; s.players = action.payload; });
    b.addCase(fetchPlayers.rejected, (s, action) => { s.loading = false; s.error = action.payload?.message || "Failed"; });
  }
});

export default playersSlice.reducer;