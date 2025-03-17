import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,
};

// Fetch All Product Reviews
export const fetchAllReviews = createAsyncThunk(
  "productReviews/fetchAllReviews",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/product-reviews`;
    try {
      const result = await axios.get(url);

      return result.data;
    } catch (error) {
      console.error("Error fetching reviews from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a Product Review
export const deleteReview = createAsyncThunk(
  "productReviews/deleteReview",
  async (id, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/product-reviews/${id}`;
    try {
      const result = await axios.delete(url);
      return result.data;
    } catch (error) {
      console.error("Error deleting review from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const AdminReviewSlice = createSlice({
  name: "productReviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.reviews = [];
        state.error = action.payload;
      })

      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.filter(
          (review) => review._id !== action.meta.arg
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default AdminReviewSlice.reducer;
