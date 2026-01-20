import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import matchesReducer from "./slices/matchesSlice";
import playersReducer from "./slices/playersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    matches: matchesReducer,
    players: playersReducer,
  },
});

export default store;
