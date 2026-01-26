import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTeams as apiGetTeams, createTeam as apiCreateTeam } from "../../services/teamApi";

const initialState = {
  teams: [],
  loading: false,
  error: null,
};

export const fetchTeams = createAsyncThunk("teams/fetch", async (_, thunkAPI) => {
  try {
    return await apiGetTeams();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

export const addTeam = createAsyncThunk("teams/add", async (data, thunkAPI) => {
  try {
    return await apiCreateTeam(data);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

const teamSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch teams";
      })
      .addCase(addTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
      })
      .addCase(addTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add team";
      });
  },
});

export default teamSlice.reducer;
