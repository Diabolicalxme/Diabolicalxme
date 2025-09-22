import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  contactList: [],
};

// Thunk to fetch all contact entries.
export const getAllContacts = createAsyncThunk(
  "contact/getAllContacts",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/contacts/get`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching contacts from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to delete a specific contact by ID.
export const deleteContact = createAsyncThunk(
  "contact/deleteContact",
  async (id, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/contacts/delete/${id}`;
    try {
      const result = await axios.delete(url);
      return { id, data: result.data };
    } catch (error) {
      console.error("Error deleting contact from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const AdminContactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle getAllContacts lifecycle
    builder
      .addCase(getAllContacts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Assuming the API response has a "data" field containing the list of contacts
        state.contactList = action.payload.data;
      })
      .addCase(getAllContacts.rejected, (state) => {
        state.isLoading = false;
        state.contactList = [];
      });

    // Handle deleteContact lifecycle
    builder
      .addCase(deleteContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the deleted contact from the list based on its _id field
        state.contactList = state.contactList.filter(
          (item) => item._id !== action.payload.id
        );
      })
      .addCase(deleteContact.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default AdminContactSlice.reducer;