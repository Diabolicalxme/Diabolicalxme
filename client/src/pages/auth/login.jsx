import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import LoginModel3D from "@/components/auth/LoginModel3D";
import logo from "@/assets/logo.png";

const initialState = {
  email: "",
  password: "",
};

const TOTAL_FIELDS = 2; // email and password

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [isFormValid, setIsFormValid] = useState(false);
  const [filledFieldsCount, setFilledFieldsCount] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { currentTheme } = useSelector((state) => state.theme);

  // Calculate form progress and update the 3D model
  const updateFormProgress = useCallback(() => {
    let count = 0;
    if (formData.email.trim()) count++;
    if (formData.password.trim()) count++;

    setFilledFieldsCount(count);

    // Update the 3D model rotation
    const progress = count / TOTAL_FIELDS;
    setFormProgress(progress);
  }, [formData]);

  // Validate the form: both email and password must be provided
  useEffect(() => {
    if (formData.email.trim() && formData.password.trim()) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
    updateFormProgress();
  }, [formData.email, formData.password, updateFormProgress]);
 
  function onSubmit(event) {
    event.preventDefault();

    // Ensure both fields are filled before dispatching
    if (!isFormValid) {
      toast({
        title: "Missing Fields",
        description: "Please fill out both email and password.",
        variant: "destructive",
      });
      return;
    }

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        // Set progress to 100% when login is successful
        setFormProgress(1);

        toast({
          title: data?.payload?.message,
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
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* 3D Model Background */}
      <div className="absolute inset-0 z-0">
        <LoginModel3D formProgress={formProgress} />
      </div>

      {/* Logo - Fixed top right on desktop only */}
      <div className="hidden md:block fixed top-4 right-4 z-30">
        <div className="w-20 h-20 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Form Overlay */}
      <div className="relative z-20 min-h-screen md:h-screen md:overflow-hidden flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Form Container - Glass effect to show model clearly */}
          <div className="md:mt-32 bg-white/5 backdrop-blur-[2px] rounded-2xl p-8 shadow-sm border border-white/10">
            <div className="text-center mb-6">
              {/* Mobile Logo - under title */}
              <div className="md:hidden w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                Sign in to your account
              </h1>
              <p className="mt-2 text-sm text-white/90 drop-shadow-md">
                Don't have an account?
                <Link
                  className="font-medium ml-2 text-white hover:text-white/80 underline drop-shadow-md"
                  to="/auth/register"
                >
                  Register
                </Link>
              </p>
              <div className="mt-3 text-xs text-white/80 drop-shadow-md">
                {filledFieldsCount} of {TOTAL_FIELDS} fields completed
              </div>
            </div>

            <CommonForm
              formControls={loginFormControls}
              buttonText={"Sign In"}
              formData={formData}
              setFormData={handleFormDataChange}
              onSubmit={onSubmit}
              disabled={!isFormValid}
              layout="single"
            />

            <div className="text-center mt-4">
              <Link
                className="text-sm text-white/80 hover:text-white underline drop-shadow-md"
                to="/auth/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLogin;