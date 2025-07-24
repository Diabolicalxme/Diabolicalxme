import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
};

// Fetch all filtered products
export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams }, { rejectWithValue }) => {

    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
    }).toString();

    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/products/get?${query}`;

    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching all filtered products from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch product details
export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/products/get/${id}`;

    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching product details from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllFilteredProducts
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
      })
      // Handle fetchProductDetails
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;
export default shoppingProductSlice.reducer;