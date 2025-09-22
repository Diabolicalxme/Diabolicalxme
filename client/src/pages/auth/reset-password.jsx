import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "@/store/auth-slice";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import LoginModel3D from "@/components/auth/LoginModel3D";
import logo from "@/assets/logo.png";
import { Home } from "lucide-react";

const initialState = {
  newPassword: "",
  confirmPassword: "",
};

const TOTAL_FIELDS = 2; // newPassword and confirmPassword

function AuthResetPassword() {
  const [formData, setFormData] = useState(initialState);
  const [filledFieldsCount, setFilledFieldsCount] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { currentTheme } = useSelector((state) => state.theme);

  // Calculate form progress and update the 3D model
  const updateFormProgress = useCallback(() => {
    let count = 0;
    if (formData.newPassword.trim()) count++;
    if (formData.confirmPassword.trim()) count++;

    setFilledFieldsCount(count);

    // Update the 3D model rotation
    const progress = count / TOTAL_FIELDS;
    setFormProgress(progress);
  }, [formData]);

  // Update progress when form data changes
  useEffect(() => {
    updateFormProgress();
  }, [formData, updateFormProgress]);

  function onSubmit(event) {
    event.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    dispatch(resetPassword({ token, newPassword: formData.newPassword })).then((data) => {
      if (data?.payload?.success) {
        // Set progress to 100% when password is reset successfully
        setFormProgress(1);

        toast({
          title: "Password reset successful!",
          description: "You can now log in with your new password.",
        });

        // Redirect to login page after a short delay
        setTimeout(() => navigate("/auth/login"), 1500);
      } else {
        toast({
          title: "Failed to reset password.",
          description: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  // Custom form data handler that updates the 3D model
  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* 3D Model Background */}
      <div className="fixed inset-0 z-0">
        <LoginModel3D formProgress={formProgress} />
      </div>

      {/* Logo - Fixed top right on desktop only */}
      <div className="hidden md:block fixed top-4 right-4 z-30">
        <div className="w-20 h-20 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Form Overlay - Mobile keyboard handling */}
      <div className="fixed inset-0 z-20 flex items-center justify-center p-4 md:relative md:h-screen">
        <div className="w-full max-w-md max-h-[100vh] overflow-y-auto md:max-h-[calc(100vh-2rem)]">

          {/* Form Container - Glass effect to show model clearly */}
          <div className="md:mt-32 bg-white/5 backdrop-blur-[2px] rounded-2xl p-8 shadow-sm border border-white/10">

            <div className="text-center mb-6">
              {/* Mobile Logo - under title */}
              <div className="md:hidden w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                Reset Your Password
              </h1>
              <p className="mt-2 text-sm text-white/90 drop-shadow-md">
                Enter your new password below to reset your account.
              </p>
              <div className="mt-3 text-xs text-white/80 drop-shadow-md">
                {filledFieldsCount} of {TOTAL_FIELDS} fields completed
              </div>
            </div>

            <CommonForm
              formControls={[
                {
                  name: "newPassword",
                  type: "password",
                  componentType: "password",
                  label: "New Password",
                  placeholder: "Enter your new password",
                  required: true,
                },
                {
                  name: "confirmPassword",
                  type: "password",
                  label: "Confirm Password",
                  componentType: "password",
                  placeholder: "Re-enter your new password",
                  required: true,
                },
              ]}
              buttonText={"Reset Password"}
              formData={formData}
              setFormData={handleFormDataChange}
              onSubmit={onSubmit}
              layout="single"
            />

            {/* Go to Home Button - Bottom Center */}
            <div className="text-center mt-6">
              <Link
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors drop-shadow-md"
                to="/shop/home"
              >
                <Home className="h-4 w-4" />
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthResetPassword;
