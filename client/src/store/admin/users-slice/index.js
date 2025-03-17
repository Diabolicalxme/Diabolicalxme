import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  usersList: [],
  selectedUser: null, // This can be used to store a single user's data if needed
};

// Thunk to fetch all users.
export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/users/get`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      console.error("Error fetching users from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to update a user's role. Expects an object with id and role.
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, role }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/users/update/${id}`;
    try {
      const result = await axios.put(url, { role });
      return result.data;
    } catch (error) {
      console.error("Error updating user role from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to delete a specific user by ID.
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/users/delete/${id}`;
    try {
      const result = await axios.delete(url);
      return { id, data: result.data };
    } catch (error) {
      console.error("Error deleting user from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const AdminUsersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // You can add synchronous reducers here if needed in the future.
  },
  extraReducers: (builder) => {
    // Handle getAllUsers lifecycle
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        // Assuming the API response has a "data" field containing the list of users
        state.usersList = action.payload.data;
      })
      .addCase(getAllUsers.rejected, (state) => {
        state.isLoading = false;
        state.usersList = [];
      });

    // Handle updateUser lifecycle
    builder
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the user's role in the usersList if the user is already loaded.
        const updatedUser = action.payload.data;
        const index = state.usersList.findIndex(user => user._id === updatedUser._id);
        if (index !== -1) {
          state.usersList[index] = updatedUser;
        }
        // Optionally update selectedUser if it matches
        if (state.selectedUser && state.selectedUser._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state) => {
        state.isLoading = false;
      });

    // Handle deleteUser lifecycle
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the deleted user from the list
        state.usersList = state.usersList.filter(
          (user) => user._id !== action.payload.id
        );
      })
      .addCase(deleteUser.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default AdminUsersSlice.reducer;