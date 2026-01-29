import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import matchesReducer from "./slices/matchesSlice";
import playersReducer from "./slices/playersSlice";
import teamsReducer from "./slices/teamSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    matches: matchesReducer,
    players: playersReducer,
    teams: teamsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;