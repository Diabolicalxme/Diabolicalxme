import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  subscribers: [],
};

// Thunk to fetch all newsletter subscribers
export const getAllSubscribers = createAsyncThunk(
  "newsletter/getAllSubscribers",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/newsletter/subscribers`;
    try {
      const result = await axios.get(url);;
      return result.data;
    } catch (error) {
      console.error("Error fetching subscribers from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to send a newsletter (emails + optional flyer/poster)
export const sendNewsletter = createAsyncThunk(
  "newsletter/sendNewsletter",
  async ({ emails, flyer, message }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/newsletter/send`;
    try {
      const result = await axios.post(url, { emails, flyer, message });
      return result.data;
    } catch (error) {
      console.error("Error sending newsletter from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to delete a subscriber by email
export const deleteSubscriber = createAsyncThunk(
  "newsletter/deleteSubscriber",
  async (email, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/newsletter/unsubscribe/${email}`;
    try {
      const result = await axios.delete(url);
      return { email, data: result.data };
    } catch (error) {
      console.error("Error deleting subscriber from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const AdminNewsLetterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle getAllSubscribers lifecycle
    builder
      .addCase(getAllSubscribers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllSubscribers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscribers = action.payload.data;
      })
      .addCase(getAllSubscribers.rejected, (state) => {
        state.isLoading = false;
        state.subscribers = [];
      });

    // Handle sendNewsletter lifecycle
    builder
      .addCase(sendNewsletter.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendNewsletter.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendNewsletter.rejected, (state) => {
        state.isLoading = false;
      });

    // Handle deleteSubscriber lifecycle
    builder
      .addCase(deleteSubscriber.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSubscriber.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscribers = state.subscribers.filter(
          (item) => item.email !== action.payload.email
        );
      })
      .addCase(deleteSubscriber.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default AdminNewsLetterSlice.reducer;
