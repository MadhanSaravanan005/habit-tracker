import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Use environment-based API URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? "/api/habits" 
  : "http://localhost:5000/api/habits";

export const fetchHabits = createAsyncThunk("habits/fetch", async () => {
  const res = await axios.get(API_URL);
  return res.data;
});

export const addHabit = createAsyncThunk("habits/add", async (habit) => {
  const res = await axios.post(API_URL, habit);
  return res.data;
});

export const completeHabit = createAsyncThunk("habits/complete", async (id) => {
  const res = await axios.put(`${API_URL}/${id}/complete`);
  return res.data;
});

export const resetHabit = createAsyncThunk("habits/reset", async (id) => {
  const res = await axios.put(`${API_URL}/${id}/reset`);
  return res.data;
});

export const deleteHabit = createAsyncThunk("habits/delete", async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const habitSlice = createSlice({
  name: "habits",
  initialState: { list: [] },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.fulfilled, (state, action) => { 
        state.list = action.payload; 
      })
      .addCase(addHabit.fulfilled, (state, action) => { 
        state.list.unshift(action.payload); 
      })
      .addCase(completeHabit.fulfilled, (state, action) => {
        const index = state.list.findIndex(h => h._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(resetHabit.fulfilled, (state, action) => {
        const index = state.list.findIndex(h => h._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.list = state.list.filter((h) => h._id !== action.payload);
      });
  }
});

export default habitSlice.reducer;