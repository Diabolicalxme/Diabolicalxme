import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  contacts: [],
  error: null,
};

// Async thunk to create a new contact entry
export const createContact = createAsyncThunk(
  "contact/createContact",
  async (contactData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/contacts/add`;
    try {
      const result = await axios.post(url, contactData);
      return result.data;
    } catch (error) {
      console.error("Error creating contact via URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shopContactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts.push(action.payload.data);
      })
      .addCase(createContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create contact";
      });
  },
});

export default shopContactSlice.reducer;