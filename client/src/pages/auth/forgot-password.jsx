import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { forgotPassword } from "@/store/auth-slice";
import LoginModel3D from "@/components/auth/LoginModel3D";
import logo from "@/assets/logo.png";
import { Home } from "lucide-react";


const initialState = {
  email: "",
};

const TOTAL_FIELDS = 1; // email only

function AuthForgotPassword() {
  const [formData, setFormData] = useState(initialState);
  const [isFormValid, setIsFormValid] = useState(false);
  const [filledFieldsCount, setFilledFieldsCount] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { currentTheme } = useSelector((state) => state.theme);

  // Calculate form progress and update the 3D model
  const updateFormProgress = useCallback(() => {
    let count = 0;
    if (formData.email.trim()) count++;

    setFilledFieldsCount(count);

    // Update the 3D model rotation
    const progress = count / TOTAL_FIELDS;
    setFormProgress(progress);
  }, [formData]);

  // Validate the form: email must not be empty
  useEffect(() => {
    if (formData.email.trim()) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
    updateFormProgress();
  }, [formData.email, updateFormProgress]);

  function onSubmit(event) {
    event.preventDefault();
    
    // Double-check validation
    if (!isFormValid) {
      toast({
        title: "Missing Field",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    dispatch(forgotPassword(formData)).then((data) => {
      if (data?.payload?.success) {
        // Set progress to 100% when email is sent successfully
        setFormProgress(1);

        toast({
          title: data?.payload?.message,
          description: "Please check your email for reset instructions.",
        });
      } else {
        toast({
          title: data?.payload?.message,
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
                Forgot Password?
              </h1>
              <p className="mt-2 text-sm text-white/90 drop-shadow-md">
                Enter your email address, and we'll send you password reset instructions.
              </p>
              <div className="mt-3 text-xs text-white/80 drop-shadow-md">
                {filledFieldsCount} of {TOTAL_FIELDS} fields completed
              </div>
            </div>

            <CommonForm
              formControls={[
                {
                  name: "email",
                  type: "email",
                  label: "Email Address",
                  placeholder: "Enter your email",
                  componentType: "input",
                  required: true,
                },
              ]}
              buttonText={"Send Reset Link"}
              formData={formData}
              setFormData={handleFormDataChange}
              onSubmit={onSubmit}
              disabled={!isFormValid}
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

export default AuthForgotPassword;