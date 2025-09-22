import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  bannersList: [], // Stores the list of banners
};

// Fetch all banners
export const fetchBanners = createAsyncThunk(
  "/banners/fetchBanners",
  async (_, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/banners/get`;

    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching banners from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingBannersSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchBanners
      .addCase(fetchBanners.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bannersList = action.payload.data; // Assuming response has a "data" property
      })
      .addCase(fetchBanners.rejected, (state) => {
        state.isLoading = false;
        state.bannersList = [];
      });
  },
});

export default shoppingBannersSlice.reducer;
