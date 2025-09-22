import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { THEMES, setTheme, setAdminRoute } from "@/store/theme-slice";

// ThemeProvider applies the current theme to the document
function ThemeProvider({ children }) {
  const { currentTheme } = useSelector((state) => state.theme);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  // Set theme based on user category when user logs in or changes
  useEffect(() => {
    if (isAuthenticated && user?.category) {
      // Map category to theme
      let themeToSet;

      switch (user.category) {
        case "Author":
          themeToSet = THEMES.BEIGE;
          break;
        case "Bravo":
          themeToSet = THEMES.BLACK;
          break;
        case "Hector":
          themeToSet = THEMES.BOTTLE_GREEN;
          break;
        default:
          themeToSet = THEMES.BLACK;
          break;
      }

      // Always update when user changes (don't compare with currentTheme)
      dispatch(setTheme(themeToSet));
    } else if (!isAuthenticated) {
      // If user is logged out, set theme to light
      dispatch(setTheme(THEMES.BLACK));
    }
  }, [isAuthenticated, user?.id, user?.category, dispatch]);

  // Check if current route is in admin section
  useEffect(() => {
    const isAdmin = location.pathname.startsWith('/admin');
    dispatch(setAdminRoute(isAdmin));

    // If entering admin section, set admin theme
    if (isAdmin) {
      // Only change theme if not already on an admin theme
      if (currentTheme !== THEMES.ADMIN_LIGHT && currentTheme !== THEMES.ADMIN_DARK) {
        // Default to admin light theme
        dispatch(setTheme(THEMES.ADMIN_LIGHT));
      }
    } else {
      // If leaving admin section and on admin theme, restore saved theme
      if (currentTheme === THEMES.ADMIN_LIGHT || currentTheme === THEMES.ADMIN_DARK) {
        // Get saved theme from localStorage or default to light
        const savedTheme = localStorage.getItem("theme") || THEMES.LIGHT;
        dispatch(setTheme(savedTheme));
      }
    }
  }, [location.pathname, dispatch, currentTheme]);

  // Apply theme to document
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      THEMES.DARK,
      THEMES.BEIGE,
      THEMES.BLACK,
      THEMES.BOTTLE_GREEN,
      THEMES.ADMIN_LIGHT,
      THEMES.ADMIN_DARK
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
        case THEMES.BOTTLE_GREEN:
          metaThemeColor.setAttribute('content', '#093624');
          break;
        case THEMES.BEIGE:
          metaThemeColor.setAttribute('content', '#EDE8D0');
          break;
        case THEMES.BLACK:
          metaThemeColor.setAttribute('content', '#000000');
          break;
        case THEMES.ADMIN_LIGHT:
          metaThemeColor.setAttribute('content', '#f5f5f5');
          break;
        case THEMES.ADMIN_DARK:
          metaThemeColor.setAttribute('content', '#1a1a1a');
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