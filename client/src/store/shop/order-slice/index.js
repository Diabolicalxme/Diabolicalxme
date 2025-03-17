import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  approvalURL: null,
  isLoading: false,
  isPaymentLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

// Create New Order
export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/order/create`;
    try {
      const response = await axios.post(url, orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating new order from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Capture Payment
export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/order/capture`;
    try {
      const response = await axios.post(url, { paymentId, payerId, orderId });
      return response.data;
    } catch (error) {
      console.error("Error capturing payment from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get All Orders By User Id
export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/order/list/${userId}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders for user from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get Order Details
export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/order/details/${id}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching order details from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create New Order
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true; // Start loading
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.approvalURL = action.payload.approvalURL;
        state.orderId = action.payload.orderId;
        sessionStorage.setItem("currentOrderId", JSON.stringify(action.payload.orderId));
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false; // Stop loading on failure
        state.approvalURL = null;
        state.orderId = null;
      })

      // Capture Payment
      .addCase(capturePayment.pending, (state) => {
        state.isPaymentLoading = true; // Keep loading during payment capture
      })
      .addCase(capturePayment.fulfilled, (state) => {
        state.isPaymentLoading = false; // Stop loading when payment is successful
      })
      .addCase(capturePayment.rejected, (state) => {
        state.isPaymentLoading = false; // Stop loading on failure
      })

      // Get All Orders By User Id
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })

      // Get Order Details
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;