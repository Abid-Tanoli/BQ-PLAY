import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import matchesReducer from "./slices/matchesSlice";
import playersReducer from "./slices/playersSlice";
import teamsReducer from "./slices/teamSlice";
import tournamentsReducer from "./slices/tournamentsSlice";
import blogsReducer from "./slices/blogSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    matches: matchesReducer,
    players: playersReducer,
    teams: teamsReducer,
    tournaments: tournamentsReducer,
    blogs: blogsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
