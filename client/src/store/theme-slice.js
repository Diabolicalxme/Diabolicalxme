import { createSlice } from "@reduxjs/toolkit";

// Define available themes
export const THEMES = {
  LIGHT: "light", // Current gray theme
  DARK: "dark",   // Black theme
  EMERALD: "emerald", // Emerald green theme
  WINE: "wine",   // Wine red theme
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
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", newTheme);
        }
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;