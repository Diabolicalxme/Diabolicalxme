import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { addToCart } from "@/store/shop/cart-slice";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LoginModel3D from "@/components/auth/LoginModel3D";
import logo from "@/assets/logo.png";
import { getTempCartItems, copyTempCartToUser } from "@/utils/tempCartManager";
import { hasCartCopyCompleted, startCartCopy, completeCartCopy } from "@/utils/cartCopyManager";
import { Home } from "lucide-react";

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
  const [isCopying, setIsCopying] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
 
  async function onSubmit(event) {
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

    // Check for temp cart items before login
    const tempCartItems = getTempCartItems();
    const hasTempItems = tempCartItems.length > 0;

    dispatch(loginUser(formData)).then(async (data) => {
      if (data?.payload?.success) {
        // Set progress to 100% when login is successful
        setFormProgress(1);

        const user = data.payload.user;

        // Show initial login success message
        toast({
          title: data?.payload?.message,
        });

        // Copy temp cart to actual cart if items exist and not already copied
        if (hasTempItems && user?.id && !hasCartCopyCompleted(user.id)) {
          if (startCartCopy(user.id)) {
            setIsCopying(true);

            try {
              const copyResult = await copyTempCartToUser(
                (cartData) => dispatch(addToCart(cartData)),
                user.id
              );

              if (copyResult.success) {
                completeCartCopy(user.id, true);
                if (copyResult.copied > 0) {
                  toast({
                    title: "Cart items copied!",
                    description: `${copyResult.copied} item${copyResult.copied > 1 ? 's' : ''} added to your cart.`,
                  });
                }
              } else {
                completeCartCopy(user.id, false);
                toast({
                  title: "Some items couldn't be copied",
                  description: `${copyResult.copied || 0} items copied, ${copyResult.failed || 0} failed.`,
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error("Error copying temp cart:", error);
              completeCartCopy(user.id, false);
              toast({
                title: "Cart copy failed",
                description: "Your temporary cart items couldn't be copied. Please add them again.",
                variant: "destructive",
              });
            } finally {
              setIsCopying(false);
            }
          }
        }

        // Navigate based on user role and redirect parameters
        if (user?.role === 'admin') {
          // Admin users always go to admin dashboard
          navigate('/admin/dashboard');
        } else {
          // Check for redirect query parameter first, then location state, then default
          const urlParams = new URLSearchParams(location.search);
          const redirectParam = urlParams.get('redirect');

          let redirectTo = '/shop/home'; // default

          if (redirectParam === 'checkout') {
            redirectTo = '/shop/checkout';
          } else if (location.state?.from) {
            redirectTo = location.state.from;
          }

          navigate(redirectTo);
        }
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
      {/* 3D Model Background - Fixed positioning to cover entire viewport */}
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
      <div className="mt-12 fixed inset-0 z-10 flex items-center justify-center p-4 md:relative md:mt-28 md:h-screen">
        <div className="w-full max-w-md max-h-[100vh] overflow-y-auto md:max-h-[calc(100vh-2rem)]">
          {/* Form Container - Glass effect to show model clearly */}
          <div className="bg-white/5 backdrop-blur-[2px] rounded-2xl p-4 md:p-8 shadow-sm border border-white/10 ">

            <div className="text-center mb-6">
              {/* Mobile Logo - under title */}
              {/* <div className="md:hidden w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div> */}

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
              buttonText={isCopying ? "Copying Cart..." : "Sign In"}
              formData={formData}
              setFormData={handleFormDataChange}
              onSubmit={onSubmit}
              disabled={!isFormValid || isCopying}
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

export default AuthLogin;