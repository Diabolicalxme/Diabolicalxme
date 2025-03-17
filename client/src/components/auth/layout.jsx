import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import RotatingMannequin from "./rotating-mannequin";

function AuthLayout() {
  const [formProgress, setFormProgress] = useState(0);
  const location = useLocation();

  // Listen for form progress updates from children components
  useEffect(() => {
    const handleFormProgress = (event) => {
      if (event.detail && typeof event.detail.progress === 'number') {
        setFormProgress(event.detail.progress);
      }
    };

    window.addEventListener('form-progress', handleFormProgress);

    return () => {
      window.removeEventListener('form-progress', handleFormProgress);
    };
  }, []);

  // Reset progress when route changes
  useEffect(() => {
    setFormProgress(0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex items-center justify-center w-1/2 px-12 bg-gradient-to-b from-gray-900 to-gray-800 relative">
        <div className="absolute inset-0 bg-opacity-10 z-0"></div>
        <div className="z-10 max-w-md space-y-6 text-center text-primary-foreground absolute top-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome to DiabolicalXme
          </h1>
        </div>

        {/* Rotating Mannequin */}
        <div className="w-full h-full flex items-center justify-center">
          <RotatingMannequin formProgress={formProgress} />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <Outlet context={{ setFormProgress }} />
      </div>
    </div>
  );
}

export default AuthLayout;