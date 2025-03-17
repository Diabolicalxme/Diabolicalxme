import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  addressList: [],
};

// Add New Address
export const addNewAddress = createAsyncThunk(
  "/addresses/addNewAddress",
  async (formData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/address/add`;
    try {
      const response = await axios.post(url, formData);
      return response.data;
    } catch (error) {
      console.error("Error adding new address from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch All Addresses for a User
export const fetchAllAddresses = createAsyncThunk(
  "/addresses/fetchAllAddresses",
  async (userId, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/address/get/${userId}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching addresses for user from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Edit an Address
export const editaAddress = createAsyncThunk(
  "/addresses/editaAddress",
  async ({ userId, addressId, formData }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/address/update/${userId}/${addressId}`;
    try {
      const response = await axios.put(url, formData);
      return response.data;
    } catch (error) {
      console.error("Error updating address from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete an Address
export const deleteAddress = createAsyncThunk(
  "/addresses/deleteAddress",
  async ({ userId, addressId }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/address/delete/${userId}/${addressId}`;
    try {
      const response = await axios.delete(url);
      return response.data;
    } catch (error) {
      console.error("Error deleting address from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add New Address
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewAddress.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addNewAddress.rejected, (state) => {
        state.isLoading = false;
      })
      // Fetch All Addresses
      .addCase(fetchAllAddresses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
      })
      .addCase(fetchAllAddresses.rejected, (state) => {
        state.isLoading = false;
        state.addressList = [];
      });
  },
});

export default addressSlice.reducer;