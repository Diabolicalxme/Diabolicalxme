import { useSelector } from "react-redux";
import { getThemeColors } from "@/utils/theme-utils";
import { useNavigate } from "react-router-dom";
import { Home, LogIn } from "lucide-react";

function UnauthPage() {
  const navigate = useNavigate();
  const { currentTheme } = useSelector((state) => state.theme);

  // Get theme-aware colors
  const themeColors = getThemeColors(currentTheme || 'arthur');

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${themeColors.cardBg}`}>
      <div className={`max-w-md w-full text-center p-8 rounded-lg border ${themeColors.borderColor} ${themeColors.cardBg}`}>
        <div className={`mb-6 ${themeColors.mutedText}`}>
          <LogIn className="h-16 w-16 mx-auto mb-4" />
        </div>

        <h1 className={`text-2xl font-bold mb-4 ${themeColors.cardText}`}>
          Access Denied
        </h1>

        <p className={`mb-8 ${themeColors.mutedText}`}>
          You don't have permission to view this page. Please sign in with appropriate credentials.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/auth/login')}
            className={`px-6 py-3 transition-colors duration-300 uppercase tracking-wider text-sm font-medium ${themeColors.buttonPrimary}`}
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('/shop/home')}
            className={`px-6 py-3 border-2 transition-colors duration-300 uppercase tracking-wider text-sm font-medium ${themeColors.buttonOutline} inline-flex items-center gap-2`}
          >
            <Home className="h-4 w-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnauthPage;
