import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import RegisterModel3D from "@/components/auth/RegisterModel3D";
import logo from "@/assets/logo.png";
import { Home } from "lucide-react";

const initialState = {
  userName: "",
  email: "",
  password: "",
  age: "",
  height: "",
  chestSize: "",
  bodyLength: "",
  shoulderLength: "",
};

// Total number of fields to track progress
const TOTAL_FIELDS = 8;

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isFormValid, setIsFormValid] = useState(false);
  const [filledFieldsCount, setFilledFieldsCount] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { currentTheme } = useSelector((state) => state.theme);

  // Calculate form progress and update the 3D model
  const updateFormProgress = useCallback(() => {
    let count = 0;
    if (formData.userName.trim()) count++;
    if (formData.email.trim()) count++;
    if (formData.password.trim()) count++;
    if (formData.age) count++;
    if (formData.height) count++;
    if (formData.chestSize) count++;
    if (formData.bodyLength) count++;
    if (formData.shoulderLength) count++;

    setFilledFieldsCount(count);

    // Update the 3D model rotation
    const progress = count / TOTAL_FIELDS;
    setFormProgress(progress);
  }, [formData]);

  // Validate that all required fields are non-empty
  useEffect(() => {
    if (
      formData.userName.trim() &&
      formData.email.trim() &&
      formData.password.trim() &&
      formData.age &&
      formData.height &&
      formData.chestSize &&
      formData.bodyLength &&
      formData.shoulderLength
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }

    // Update form progress for mannequin rotation
    updateFormProgress();
  }, [
    formData.userName,
    formData.email,
    formData.password,
    formData.age,
    formData.height,
    formData.chestSize,
    formData.bodyLength,
    formData.shoulderLength,
    updateFormProgress
  ]);

  function onSubmit(event) {
    event.preventDefault();
    // Show validation feedback if fields are missing
    if (!isFormValid) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields before signing up.",
        variant: "destructive",
      });
      return;
    }

    // Convert numeric fields from strings to numbers
    const processedFormData = {
      ...formData,
      age: Number(formData.age),
      height: Number(formData.height),
      chestSize: Number(formData.chestSize),
      bodyLength: Number(formData.bodyLength),
      shoulderLength: Number(formData.shoulderLength),
    };

    dispatch(registerUser(processedFormData)).then((data) => {
      if (data?.payload?.success) {
        // Set progress to 100% when form is successfully submitted
        setFormProgress(1);

        toast({
          title: data?.payload?.message,
        });

        // Short delay to show the completed model rotation
        setTimeout(() => {
          // Pass the original destination to login page
          const redirectTo = location.state?.from;
          if (redirectTo) {
            navigate("/auth/login", { state: { from: redirectTo } });
          } else {
            navigate("/auth/login");
          }
        }, 1000);
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
        <RegisterModel3D formProgress={formProgress} />
      </div>

      {/* Logo - Fixed top right on desktop only */}
      <div className="hidden md:block fixed top-4 right-4 z-30">
        <div className="w-20 h-20 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Form Overlay - Mobile keyboard handling */}
      <div className="mt-12 fixed inset-0 z-10 flex items-center justify-center p-4 md:relative md:mt-24 md:h-screen">
        <div className="w-full max-w-2xl max-h-[100vh] overflow-y-auto md:max-h-[calc(100vh-2rem)]">

          {/* Form Container - Glass effect to show model clearly */}
          <div className="bg-white/5 backdrop-blur-[2px] rounded-2xl p-4 md:p-6 shadow-sm border border-white/10 max-h-[80vh] overflow-y-auto">

            <div className="text-center mb-6">
              {/* Mobile Logo - under title */}
              {/* <div className="md:hidden w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div> */}

              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-white/90 drop-shadow-md">
                Already have an account?
                <Link
                  className="font-medium ml-2 text-white hover:text-white/80 underline drop-shadow-md"
                  to="/auth/login"
                >
                  Sign in
                </Link>
              </p>
              <div className="mt-3 text-xs text-white/80 drop-shadow-md">
                {filledFieldsCount} of {TOTAL_FIELDS} fields completed
              </div>
            </div>

            <CommonForm
              formControls={registerFormControls}
              buttonText={"Create Account"}
              formData={formData}
              setFormData={handleFormDataChange}
              onSubmit={onSubmit}
              disabled={!isFormValid}
              layout="two-column"
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

export default AuthRegister;