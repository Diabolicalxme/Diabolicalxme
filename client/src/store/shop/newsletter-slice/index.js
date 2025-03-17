import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  success: null,
  error: null,
};

// Async thunk to create a new newsletter subscription
export const createSubscription = createAsyncThunk(
  "newsletter/createSubscription",
  async (subscriptionData, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/newsletter/subscribe`;

    try {
      const result = await axios.post(url, subscriptionData);
      return result.data;
    } catch (error) {
      console.error("Error creating subscription via URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const ShopNewsLetterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle createSubscription lifecycle
    builder
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message || "Subscription successful!";
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to subscribe";
      });
  },
});

export default ShopNewsLetterSlice.reducer;
