import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  categoriesList: [],
};

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  "/categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/categories/get`;

    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching categories from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingCategoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoriesList = action.payload.data; // Assuming response has a "data" property
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.isLoading = false;
        state.categoriesList = [];
      });
  },
});

export default shoppingCategoriesSlice.reducer;
