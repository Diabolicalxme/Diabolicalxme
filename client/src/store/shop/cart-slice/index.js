import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  isLoading: false,
};

// Add to Cart - Enhanced to handle products with and without color options
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity, colorId, product }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/cart/add`;

    try {
      // If colorId is not provided but product has colors, use the first color
      let finalColorId = colorId;

      // Only use colors if the product has them
      if (!finalColorId && product?.colors && product.colors.length > 0) {
        finalColorId = product.colors[0]._id;
      }

      // For products without colors, don't send a colorId
      const payload = {
        userId,
        productId,
        quantity
      };

      // Only add colorId to the payload if it exists
      if (finalColorId) {
        payload.colorId = finalColorId;
      }

      // Make the API call with the appropriate payload
      const response = await axios.post(url, payload);

      return response.data;
    } catch (error) {
      console.error("Error adding to cart from URL:", url, error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Cart Items
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/cart/get/${userId}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching cart items from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete Cart Item - Enhanced to handle composite IDs
export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, colorId }, { rejectWithValue }) => {
    // Always use colorId in the URL if available for precise item deletion
    const url = colorId
      ? `${import.meta.env.VITE_BACKEND_URL}/shop/cart/${userId}/${productId}/${colorId}`
      : `${import.meta.env.VITE_BACKEND_URL}/shop/cart/${userId}/${productId}`;

    try {
      const response = await axios.delete(url);
      return response.data;
    } catch (error) {
      console.error("Error deleting cart item from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update Cart Quantity - Enhanced to handle color conflicts
export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity, colorId, oldColorId }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/cart/update-cart`;
    try {
      // Build the payload with required fields
      const payload = {
        userId,
        productId
      };

      // Only add quantity to the payload if it exists
      if (quantity !== undefined) {
        payload.quantity = quantity;
      }

      // Only add colorId and oldColorId to the payload if they exist
      if (colorId) {
        payload.colorId = colorId;
      }

      if (oldColorId) {
        payload.oldColorId = oldColorId;
      }

      console.log("Sending update cart request with payload:", payload);

      // Make the API call with the appropriate payload
      const response = await axios.put(url, payload);

      return response.data;
    } catch (error) {
      console.error("Error updating cart quantity from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = Array.isArray(action.payload.data?.items)
          ? action.payload.data.items.map(item => ({
              ...item,
              colors: item.colors || [],
            }))
          : [];
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
      })
      // Fetch Cart Items
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = Array.isArray(action.payload.data?.items)
          ? action.payload.data.items.map(item => ({
              ...item,
              colors: item.colors || [],
            }))
          : [];
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      // Update Cart Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = Array.isArray(action.payload.data?.items)
          ? action.payload.data.items.map(item => ({
              ...item,
              colors: item.colors || [],
            }))
          : [];
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
      })
      // Delete Cart Item
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = Array.isArray(action.payload.data?.items)
          ? action.payload.data.items.map(item => ({
              ...item,
              colors: item.colors || [],
            }))
          : [];
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
