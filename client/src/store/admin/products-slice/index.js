import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
};

// Add New Product
export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/products/add`;
    try {
      const result = await axios.post(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return result.data;
    } catch (error) {
      console.error("Error adding new product from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch All Products
export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/products/get`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching all products from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Edit Product
export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/products/edit/${id}`;
    try {
      const result = await axios.put(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return result.data;
    } catch (error) {
      console.error("Error editing product from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete Product
export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/products/delete/${id}`;
    try {
      const result = await axios.delete(url);
      return result.data;
    } catch (error) {
      console.error("Error deleting product from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchAllProducts lifecycle
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
      });
  },
});

export default AdminProductsSlice.reducer;