import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  summary: null,
  salesChart: [],
  orderStatus: [],
  stockStatus: null,
  categoryProducts: [],
  error: null,
};

// Thunk to fetch dashboard summary
export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/summary`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to fetch sales chart data
export const fetchSalesChart = createAsyncThunk(
  "dashboard/fetchSalesChart",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/sales-chart`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching sales chart data:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to fetch order status data
export const fetchOrderStatus = createAsyncThunk(
  "dashboard/fetchOrderStatus",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/order-status`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching order status data:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to fetch stock status data
export const fetchStockStatus = createAsyncThunk(
  "dashboard/fetchStockStatus",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/stock-status`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching stock status data:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to fetch category products data
export const fetchCategoryProducts = createAsyncThunk(
  "dashboard/fetchCategoryProducts",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/category-products`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching category products data:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminDashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle fetchDashboardSummary lifecycle
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.summary = null;
        state.error = action.payload;
      });

    // Handle fetchSalesChart lifecycle
    builder
      .addCase(fetchSalesChart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesChart = action.payload;
      })
      .addCase(fetchSalesChart.rejected, (state, action) => {
        state.isLoading = false;
        state.salesChart = [];
        state.error = action.payload;
      });

    // Handle fetchOrderStatus lifecycle
    builder
      .addCase(fetchOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderStatus = action.payload;
      })
      .addCase(fetchOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.orderStatus = [];
        state.error = action.payload;
      });

    // Handle fetchStockStatus lifecycle
    builder
      .addCase(fetchStockStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStockStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stockStatus = action.payload;
      })
      .addCase(fetchStockStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.stockStatus = null;
        state.error = action.payload;
      });

    // Handle fetchCategoryProducts lifecycle
    builder
      .addCase(fetchCategoryProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryProducts = action.payload;
      })
      .addCase(fetchCategoryProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.categoryProducts = [];
        state.error = action.payload;
      });
  },
});

export default adminDashboardSlice.reducer;
