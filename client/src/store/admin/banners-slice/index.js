import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  bannerList: [],
};

// Add New Banner
export const addNewBanner = createAsyncThunk(
  "/banners/addNewBanner",
  async (formData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/banners/add`;

    try {
      const result = await axios.post(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return result.data;
    } catch (error) {
      // Log the error details for debugging
      console.error("Error adding new banner:", {
        message: error.message,
        response: error.response?.data,
        url,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch All Banners
export const fetchAllBanners = createAsyncThunk(
  "/banners/fetchAllBanners",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/banners/get`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching all banners from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Edit Banner
export const editBanner = createAsyncThunk(
  "/banners/editBanner",
  async ({ id, formData }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/banners/edit/${id}`;
    try {
      const result = await axios.put(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return result.data;
    } catch (error) {
      console.error("Error editing banner from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete Banner
export const deleteBanner = createAsyncThunk(
  "/banners/deleteBanner",
  async (id, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/banners/delete/${id}`;
    try {
      const result = await axios.delete(url);
      return result.data;
    } catch (error) {
      console.error("Error deleting banner from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const bannersSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchAllBanners lifecycle
      .addCase(fetchAllBanners.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bannerList = action.payload.data;
      })
      .addCase(fetchAllBanners.rejected, (state) => {
        state.isLoading = false;
        state.bannerList = [];
      });
  },
});

export default bannersSlice.reducer;