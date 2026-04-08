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
        err.response?.data?.message || err.message || "Failed to fetch matches"
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
        err.response?.data?.message || err.message || "Failed to fetch match"
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
        err.response?.data?.message || err.message || "Failed to create match"
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
        err.response?.data?.message || err.message || "Failed to update match"
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
        err.response?.data?.message || err.message || "Failed to delete match"
      );
    }
  }
);

export const updateScore = createAsyncThunk(
  "matches/updateScore",
  async (payload, thunkAPI) => {
    const { matchId, ...data } = payload;
    try {
      const res = await api.post(`/matches/${matchId}/score`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update score"
      );
    }
  }
);

export const updateMatchStatus = createAsyncThunk(
  "matches/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const res = await api.put(`/matches/${id}/status`, { status });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update status"
      );
    }
  }
);

export const updateToss = createAsyncThunk(
  "matches/updateToss",
  async ({ matchId, tossWinnerId, decision }, thunkAPI) => {
    try {
      const res = await api.put(`/matches/${matchId}/toss`, { tossWinnerId, decision });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update toss"
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
        err.response?.data?.message || err.message || "Failed to set Playing XI"
      );
    }
  }
);

export const setSquad15 = createAsyncThunk(
  "matches/setSquad15",
  async ({ matchId, teamId, players, captain, viceCaptain, wicketKeepers }, thunkAPI) => {
    try {
      const res = await api.put(`/matches/${matchId}/squad15`, { teamId, players, captain, viceCaptain, wicketKeepers });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to set squad"
      );
    }
  }
);

export const setTwelfthMan = createAsyncThunk(
  "matches/setTwelfthMan",
  async ({ matchId, teamId, playerId }, thunkAPI) => {
    try {
      const res = await api.put(`/matches/${matchId}/twelfth-man`, { teamId, playerId });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to set 12th man"
      );
    }
  }
);

export const setTeamRoles = createAsyncThunk(
  "matches/setTeamRoles",
  async ({ matchId, teamId, captain, viceCaptain, wicketKeepers }, thunkAPI) => {
    try {
      const res = await api.put(`/matches/${matchId}/team-roles`, { teamId, captain, viceCaptain, wicketKeepers });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to set team roles"
      );
    }
  }
);

export const updateWicketKeeper = createAsyncThunk(
  "matches/updateWicketKeeper",
  async ({ matchId, teamId, wicketKeeperId }, thunkAPI) => {
    try {
      const match = await api.get(`/matches/${matchId}`);
      const currentRoles = match.data.teamRoles?.find(r => r.team._id === teamId || r.team === teamId);
      const updatedWicketKeepers = [wicketKeeperId];
      const res = await api.put(`/matches/${matchId}/team-roles`, {
        teamId,
        captain: currentRoles?.captain,
        viceCaptain: currentRoles?.viceCaptain,
        wicketKeepers: updatedWicketKeepers
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update wicket-keeper"
      );
    }
  }
);

export const setOpeners = createAsyncThunk(
  "matches/setOpeners",
  async ({ matchId, inningsIndex, batsman1Id, batsman2Id }, thunkAPI) => {
    try {
      const res = await api.put(`/matches/${matchId}/openers`, {
        inningsIndex,
        batsman1Id,
        batsman2Id
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to set openers"
      );
    }
  }
);

export const resolveTie = createAsyncThunk(
  "matches/resolveTie",
  async ({ matchId, resolution }, thunkAPI) => {
    try {
      const res = await api.post(`/matches/${matchId}/resolve-tie`, { resolution });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to resolve tie"
      );
    }
  }
);

export const startSuperOver = createAsyncThunk(
  "matches/startSuperOver",
  async ({ matchId, batsmenIds, bowlerId }, thunkAPI) => {
    try {
      const res = await api.post(`/matches/${matchId}/start-super-over`, {
        batsmenIds,
        bowlerId
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to start Super Over"
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

      .addCase(updateMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMatch.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })
      .addCase(updateMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = state.matches.filter((m) => m._id !== action.payload);
        if (state.currentMatch?._id === action.payload) {
          state.currentMatch = null;
        }
      })
      .addCase(deleteMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateScore.pending, (state) => {
        state.error = null;
      })
      .addCase(updateScore.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
        }
      })
      .addCase(updateScore.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateMatchStatus.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })

      .addCase(updateToss.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })

      .addCase(setPlayingXI.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })

      .addCase(setSquad15.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })

      .addCase(setTwelfthMan.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })

      .addCase(setTeamRoles.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })

      .addCase(updateWicketKeeper.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })

      .addCase(setOpeners.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })
      .addCase(resolveTie.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      })
      .addCase(startSuperOver.fulfilled, (state, action) => {
        const updated = action.payload?.match || action.payload;
        if (updated) {
          const index = state.matches.findIndex((m) => m._id === updated._id);
          if (index !== -1) {
            state.matches[index] = updated;
          }
          if (state.currentMatch?._id === updated._id) {
            state.currentMatch = updated;
          }
        }
      });
  },
});

export const { clearCurrentMatch, clearError } = matchesSlice.actions;
export default matchesSlice.reducer;