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
import { Home, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const initialState = {
  email: "",
  password: "",
};

const TOTAL_STEPS = 2;

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading: isAuthLoading } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const formProgress = currentStep / (TOTAL_STEPS - 1);

  const handleNext = async () => {
    setError("");
    if (currentStep === 0) {
      if (!formData.email.trim()) {
        const msg = "Email Required";
        setError(msg);
        toast({ title: msg, variant: "destructive" });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        const msg = "Invalid Email";
        setError(msg);
        toast({ title: msg, variant: "destructive" });
        return;
      }

      setIsCheckingEmail(true);
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/check-email`, {
          email: formData.email,
        });
        if (response.data.success) {
          setCurrentStep(prev => prev + 1);
        } else {
          setError(response.data.message);
          toast({
            title: "Validation Error",
            description: response.data.message,
            variant: "destructive",
          });
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || "Error validating email. Please try again.";
        setError(errMsg);
        toast({
          title: "Network Error",
          description: errMsg,
          variant: "destructive",
        });
      } finally {
        setIsCheckingEmail(false);
      }
      return;
    }
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (isCheckingEmail) return;
      if (currentStep < TOTAL_STEPS - 1) {
        handleNext();
      } else {
        onSubmit(e);
      }
    }
  };

  async function onSubmit(event) {
    if (event) event.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      const msg = "Please fill out both email and password.";
      setError(msg);
      toast({
        title: "Missing Fields",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    const tempCartItems = getTempCartItems();
    const hasTempItems = tempCartItems.length > 0;

    dispatch(loginUser(formData)).then(async (data) => {
      if (data?.payload?.success) {
        const user = data.payload.user;
        toast({ title: data?.payload?.message });

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
              }
            } catch (error) {
              console.error("Error copying temp cart:", error);
              completeCartCopy(user.id, false);
            } finally {
              setIsCopying(false);
            }
          }
        }

        if (user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          const urlParams = new URLSearchParams(location.search);
          const redirectParam = urlParams.get('redirect');
          let redirectTo = '/shop/home';
          if (redirectParam === 'checkout') {
            redirectTo = '/shop/checkout';
          } else if (location.state?.from) {
            redirectTo = location.state.from;
          }
          navigate(redirectTo);
        }
      } else {
        const errMsg = data?.payload?.message 
          || (typeof data?.payload === 'string' ? data.payload : null)
          || data?.error?.message 
          || "Login failed. Please try again.";
        setError(errMsg);
        toast({
          title: errMsg,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-transparent">
      {/* 3D Model Background */}
      <div className="fixed inset-0 z-0 opacity-70">
        <LoginModel3D formProgress={formProgress} />
      </div>

      {/* Logo */}
      <div className="fixed top-8 right-4 md:right-8 z-30">
        <img src={logo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl" />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-end opacity-100 pb-[25vh] px-4">
        <div className="w-full max-w-lg space-y-12">

          <div className="relative overflow-hidden  flex items-center justify-center">
            {currentStep === 0 && (
              <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500">
                <input
                  autoFocus
                  disabled={isCheckingEmail}
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => {
                    setError("");
                    setFormData({ ...formData, email: e.target.value });
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 border-b-2 border-white/20 focus:border-white focus:outline-none py-4 text-3xl md:text-4xl text-white placeholder:text-white/30 transition-all text-center font-light tracking-wider disabled:opacity-50"
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500 text-center relative">
                <input
                  autoFocus
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => {
                    setError("");
                    setFormData({ ...formData, password: e.target.value });
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 border-b-2 border-white/20 focus:border-white focus:outline-none py-4 text-3xl md:text-4xl text-white placeholder:text-white/70 transition-all text-center font-light tracking-wider pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/3 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
                <button
                  onClick={onSubmit}
                  disabled={isAuthLoading || isCopying || !formData.password}
                  className="mt-8 px-12 py-3 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all disabled:opacity-50 tracking-widest uppercase text-sm"
                >
                  {isAuthLoading || isCopying ? "Signing In..." : "Sign In"}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-center text-sm font-semibold tracking-wide bg-black/40 py-2 px-4 rounded-md border border-red-500/20 backdrop-blur-sm animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-12 pt-4">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                disabled={isCheckingEmail}
                className="text-white/50 hover:text-white transition-colors text-sm uppercase tracking-[0.2em] disabled:opacity-50"
              >
                Back
              </button>
            )}

            {currentStep < TOTAL_STEPS - 1 && (
              <button
                onClick={handleNext}
                disabled={isCheckingEmail}
                className="text-white hover:text-white/80 transition-colors text-sm uppercase tracking-[0.2em] font-bold disabled:opacity-50"
              >
                {isCheckingEmail ? "Checking..." : "Next"}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-12 left-0 w-full flex flex-col items-center gap-4 z-20">
          <div className="flex items-center gap-6">
            <Link
              className="text-white/40 hover:text-white text-xs uppercase tracking-[0.3em] transition-all"
              to="/auth/register"
            >
              No account? Register
            </Link>
            <div className="w-[1px] h-4 bg-white/20" />
            <Link
              className="text-white/40 hover:text-white text-xs uppercase tracking-[0.3em] transition-all"
              to="/auth/forgot-password"
            >
              Forgot?
            </Link>
          </div>

          <Link
            className="mt-2 text-white/40 hover:text-white transition-all p-2 rounded-full border border-white/10 hover:border-white/30"
            to="/shop/home"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthLogin;
