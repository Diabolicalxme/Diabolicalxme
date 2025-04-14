import { createSlice } from "@reduxjs/toolkit";

// Define available themes
export const THEMES = {
  LIGHT: "light", // Current gray theme
  DARK: "dark",   // Black theme (legacy)
  EMERALD: "emerald", // Emerald green theme (legacy)
  WINE: "wine",   // Wine red theme (legacy)
  BOTTLE_GREEN: "bottle-green", // Bottle green theme for Hector (#093624)
  BEIGE: "beige", // Beige theme for Author (#EDE8D0)
  BLACK: "black", // Black theme for Bravo (#000000)
  ADMIN_LIGHT: "admin-light", // Admin light theme
  ADMIN_DARK: "admin-dark", // Admin dark theme
};

// Get initial theme from localStorage or default to light
const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      return savedTheme;
    }
  }
  return THEMES.LIGHT;
};

const initialState = {
  currentTheme: getInitialTheme(),
  isAdminRoute: false, // Track if we're in admin section
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const newTheme = action.payload;
      if (Object.values(THEMES).includes(newTheme)) {
        state.currentTheme = newTheme;
        // Save to localStorage for persistence
        // Only save non-admin themes to localStorage
        if (typeof window !== "undefined" &&
            newTheme !== THEMES.ADMIN_LIGHT &&
            newTheme !== THEMES.ADMIN_DARK) {
          localStorage.setItem("theme", newTheme);
        }
      }
    },
    setAdminRoute: (state, action) => {
      state.isAdminRoute = action.payload;
    },
  },
});

export const { setTheme, setAdminRoute } = themeSlice.actions;
export default themeSlice.reducer;