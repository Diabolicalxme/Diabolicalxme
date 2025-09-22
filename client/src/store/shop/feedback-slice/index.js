import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  feedbackList: [],
  error: null,
};

// Async thunk to create a new feedback entry
export const createFeedback = createAsyncThunk(
  "feedback/createFeedback",
  async (feedbackData, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/feedback/add`;

    try {
      const result = await axios.post(url, feedbackData);
      return result.data;
    } catch (error) {
      console.error("Error creating feedback via URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to fetch all feedback entries
export const fetchFeedback = createAsyncThunk(
  "feedback/fetchFeedback",
  async (_, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/feedback/get`;

    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching feedback via URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shopFeedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle createFeedback lifecycle
    builder
      .addCase(createFeedback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        // Assuming the API response returns the newly created feedback entry
        state.feedbackList.push(action.payload.data);
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create feedback";
      });

    // Handle fetchFeedback lifecycle
    builder
      .addCase(fetchFeedback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        // Assuming the API response has a "data" property containing the feedback list
        state.feedbackList = action.payload.data;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch feedback";
      });
  },
});

export default shopFeedbackSlice.reducer;