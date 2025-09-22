import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
  import axios from "axios";

  const initialState = {
    isLoading: false,
    feedbackList: [],
    selectedFeedback: null,
  };

  // Thunk to fetch all feedback entries.
  export const getAllFeedback = createAsyncThunk(
    "feedback/getAllFeedback",
    async (_, { rejectWithValue }) => {
      const url = `${import.meta.env.VITE_BACKEND_URL}/admin/feedback/get`;
      try {
        const result = await axios.get(url);
        return result.data;
      } catch (error) {
        console.error("Error fetching all feedback entries from URL:", url, error);
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  // Thunk to fetch a specific feedback by ID.
  export const getFeedback = createAsyncThunk(
    "feedback/getFeedback",
    async (id, { rejectWithValue }) => {
      const url = `${import.meta.env.VITE_BACKEND_URL}/admin/feedback/${id}`;
      try {
        const result = await axios.get(url);
        return result.data;
      } catch (error) {
        console.error("Error fetching feedback from URL:", url, error);
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  // Thunk to delete a specific feedback by ID.
  export const deleteFeedback = createAsyncThunk(
    "feedback/deleteFeedback",
    async (id, { rejectWithValue }) => {
      const url = `${import.meta.env.VITE_BACKEND_URL}/admin/feedback/delete/${id}`;
      try {
        const result = await axios.delete(url);
        return { id, data: result.data };
      } catch (error) {
        console.error("Error deleting feedback from URL:", url, error);
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  const AdminFeedbackSlice = createSlice({
    name: "feedback",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      // Handle getAllFeedback lifecycle
      builder
        .addCase(getAllFeedback.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(getAllFeedback.fulfilled, (state, action) => {
          state.isLoading = false;
          // Assuming the API response has a "data" field containing the list of feedback entries
          state.feedbackList = action.payload.data;
        })
        .addCase(getAllFeedback.rejected, (state) => {
          state.isLoading = false;
          state.feedbackList = [];
        });

      // Handle getFeedback lifecycle
      builder
        .addCase(getFeedback.pending, (state) => {
          state.isLoading = true;
          state.selectedFeedback = null;
        })
        .addCase(getFeedback.fulfilled, (state, action) => {
          state.isLoading = false;
          // Assuming the API response has a "data" field with the feedback details
          state.selectedFeedback = action.payload.data;
        })
        .addCase(getFeedback.rejected, (state) => {
          state.isLoading = false;
          state.selectedFeedback = null;
        });

      // Handle deleteFeedback lifecycle
      builder
        .addCase(deleteFeedback.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(deleteFeedback.fulfilled, (state, action) => {
          state.isLoading = false;
          // Remove the deleted feedback from the list
          state.feedbackList = state.feedbackList.filter(
            (item) => item._id !== action.payload.id
          );
        })
        .addCase(deleteFeedback.rejected, (state) => {
          state.isLoading = false;
        });
    },
  });

  export default AdminFeedbackSlice.reducer;