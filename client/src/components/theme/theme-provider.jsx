import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { THEMES, setTheme } from "@/store/theme-slice";

// ThemeProvider applies the current theme to the document
function ThemeProvider({ children }) {
  const { currentTheme } = useSelector((state) => state.theme);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Set theme based on user category when user logs in or changes
  useEffect(() => {
    if (isAuthenticated && user?.category) {
      // Map category to theme
      let themeToSet;

      switch (user.category) {
        case "Author":
          themeToSet = THEMES.EMERALD;
          break;
        case "Bravo":
          themeToSet = THEMES.WINE;
          break;
        case "Hector":
          themeToSet = THEMES.DARK;
          break;
        default:
          themeToSet = THEMES.LIGHT;
          break;
      }

      // Always update when user changes (don't compare with currentTheme)
      dispatch(setTheme(themeToSet));
    }
  }, [isAuthenticated, user?.id, user?.category, dispatch]);

  // Apply theme to document
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      THEMES.DARK,
      THEMES.EMERALD,
      THEMES.WINE
    );

    // Add the current theme class if it's not the default light theme
    if (currentTheme !== THEMES.LIGHT) {
      document.documentElement.classList.add(currentTheme);
    }
  }, [currentTheme]);

  return children;
}

export default ThemeProvider;