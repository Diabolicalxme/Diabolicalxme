import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  instaFeedPosts: [], 
};

// Fetch all Instagram feed posts
export const fetchInstaFeed = createAsyncThunk(
  "/instafeed/fetchInstaFeed",
  async (_, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/instafeed/get`;

    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching Instagram feed posts from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingInstaFeedSlice = createSlice({
  name: "instafeed",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchInstaFeed
      .addCase(fetchInstaFeed.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInstaFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.instaFeedPosts = action.payload.data[0].posts;
      })
      .addCase(fetchInstaFeed.rejected, (state) => {
        state.isLoading = false;
        state.instaFeedPosts = [];
      });
  },
});

export default shoppingInstaFeedSlice.reducer;
