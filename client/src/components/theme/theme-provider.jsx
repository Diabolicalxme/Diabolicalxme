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

    // Set a data attribute for easier CSS targeting
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // Set appropriate color based on theme
      switch (currentTheme) {
        case THEMES.DARK:
          metaThemeColor.setAttribute('content', '#121212');
          break;
        case THEMES.EMERALD:
          metaThemeColor.setAttribute('content', '#064e3b');
          break;
        case THEMES.WINE:
          metaThemeColor.setAttribute('content', '#7f1d1d');
          break;
        default:
          metaThemeColor.setAttribute('content', '#ffffff');
          break;
      }
    }
  }, [currentTheme]);

  return children;
}

export default ThemeProvider;