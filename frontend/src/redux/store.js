import { configureStore } from "@reduxjs/toolkit";
import habitReducer from "./habitSlice";

export const store = configureStore({
  reducer: {
    habits: habitReducer,
  },
});