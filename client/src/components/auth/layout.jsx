import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function AuthLayout() {
  const [formProgress, setFormProgress] = useState(0);
  const location = useLocation();

  // Check if current route uses the new 3D model layout
  const isRegisterPage = location.pathname.includes('/register');
  const isLoginPage = location.pathname.includes('/login');
  const isForgotPasswordPage = location.pathname.includes('/forgot-password');
  const isResetPasswordPage = location.pathname.includes('/reset-password');
  const uses3DLayout = isRegisterPage || isLoginPage || isForgotPasswordPage || isResetPasswordPage;

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

  // For register, login, forgot-password, and reset-password pages, use full-screen 3D layout
  if (uses3DLayout) {
    return <Outlet context={{ setFormProgress }} />;
  }

  // For other auth pages (login), use the traditional two-panel layout
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex items-center justify-center w-1/2 px-12 bg-gradient-to-b from-gray-900 to-gray-800 relative">
        <div className="absolute inset-0 bg-opacity-10 z-0"></div>
        <div className="z-10 max-w-md space-y-6 text-center text-primary-foreground absolute top-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome to DiabolicalXme
          </h1>
        </div>

    
      </div>
      <div className="flex flex-1 items-center justify-center bg-background text-foreground px-4 py-12 sm:px-6 lg:px-8">
        <Outlet context={{ setFormProgress }} />
      </div>
    </div>
  );
}

export default AuthLayout;