import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  instaFeedPosts: [],
};

// Add New InstaFeed Post
export const addNewInstaFeedPost = createAsyncThunk(
  "/instafeed/addNewPost",
  async (formData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/instafeed/add`;
    try {
      const result = await axios.post(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return result.data;
    } catch (error) {
      console.error("Error adding new InstaFeed post:", {
        message: error.message,
        response: error.response?.data,
        url,
      });

      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch All InstaFeed Posts
export const fetchAllInstaFeedPosts = createAsyncThunk(
  "/instafeed/fetchAllPosts",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/instafeed/get`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching all InstaFeed posts from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Edit InstaFeed Post
export const editInstaFeedPost = createAsyncThunk(
  "/instafeed/editPost",
  async ({ id, formData }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/instafeed/edit/${id}`;
    try {
      const result = await axios.put(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return result.data;
    } catch (error) {
      console.error("Error editing InstaFeed post from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete InstaFeed Post
export const deleteInstaFeedPost = createAsyncThunk(
  "/instafeed/deletePost",
  async (id, { rejectWithValue }) => {
    const encodedId = encodeURIComponent(id);
const url = `${import.meta.env.VITE_BACKEND_URL}/admin/instafeed/delete/${encodedId}`;

  
    try {
      const result = await axios.delete(url);
      return result.data;
    } catch (error) {
      console.error("Error deleting InstaFeed post from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const InstaFeedSlice = createSlice({
  name: "instaFeed",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchAllInstaFeedPosts lifecycle
      .addCase(fetchAllInstaFeedPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllInstaFeedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.instaFeedPosts = action.payload.data;
      })
      .addCase(fetchAllInstaFeedPosts.rejected, (state) => {
        state.isLoading = false;
        state.instaFeedPosts = [];
      });
  },
});

export default InstaFeedSlice.reducer;
