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

const TOTAL_STEPS = 2;

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCopying, setIsCopying] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const formProgress = currentStep / (TOTAL_STEPS - 1);

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.email.trim()) {
        toast({ title: "Email Required", variant: "destructive" });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast({ title: "Invalid Email", variant: "destructive" });
        return;
      }
    }
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (currentStep < TOTAL_STEPS - 1) {
        handleNext();
      } else {
        onSubmit(e);
      }
    }
  };

  async function onSubmit(event) {
    if (event) event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill out both email and password.",
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
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-transparent">
      {/* 3D Model Background */}
      <div className="fixed inset-0 z-0">
        <LoginModel3D formProgress={formProgress} />
      </div>

      {/* Logo */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-30">
        <img src={logo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl" />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-end pb-[25vh] px-4">
        <div className="w-full max-w-lg space-y-12">

          <div className="relative overflow-hidden h-32 flex items-center justify-center">
            {currentStep === 0 && (
              <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500">
                <input
                  autoFocus
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 border-b-2 border-white/20 focus:border-white focus:outline-none py-4 text-3xl md:text-4xl text-white placeholder:text-white/30 transition-all text-center font-light tracking-wider"
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500 text-center">
                <input
                  autoFocus
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 border-b-2 border-white/20 focus:border-white focus:outline-none py-4 text-3xl md:text-4xl text-white placeholder:text-white/30 transition-all text-center font-light tracking-wider"
                />
                <button
                  onClick={onSubmit}
                  disabled={isCopying || !formData.password}
                  className="mt-8 px-12 py-3 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all disabled:opacity-50 tracking-widest uppercase text-sm"
                >
                  {isCopying ? "Signing In..." : "Sign In"}
                </button>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-12 pt-4">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="text-white/50 hover:text-white transition-colors text-sm uppercase tracking-[0.2em]"
              >
                Back
              </button>
            )}

            {currentStep < TOTAL_STEPS - 1 && (
              <button
                onClick={handleNext}
                className="text-white hover:text-white/80 transition-colors text-sm uppercase tracking-[0.2em] font-bold"
              >
                Next
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
