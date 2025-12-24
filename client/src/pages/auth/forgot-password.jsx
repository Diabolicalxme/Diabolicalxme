import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "@/store/auth-slice";
import LoginModel3D from "@/components/auth/LoginModel3D";
import logo from "@/assets/logo.png";
import { Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialState = {
  email: "",
};

const STEPS = [
  {
    name: "email",
    label: "Email Address",
    placeholder: "Enter your registered email",
    type: "email"
  }
];

const TOTAL_STEPS = STEPS.length;

function AuthForgotPassword() {
  const [formData, setFormData] = useState(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formProgress = currentStep / (TOTAL_STEPS); // For 1 step, we handle it slightly differently

  const handleNext = () => {
    const activeStep = STEPS[currentStep];
    const value = formData[activeStep.name];

    if (!value || !value.trim()) {
      toast({ title: "Email Required", variant: "destructive" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({ title: "Invalid Email", variant: "destructive" });
      return;
    }

    // Since it's only 1 step, handleNext is basically Submit for now
    onSubmit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  function onSubmit(event) {
    if (event) event.preventDefault();

    dispatch(forgotPassword(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Email Sent",
          description: "Please check your inbox for reset instructions.",
        });
        // Optionally redirect to login or check email page
        setTimeout(() => navigate("/auth/login"), 3000);
      } else {
        toast({
          title: data?.payload?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    });
  }

  const activeStep = STEPS[currentStep];

  return (
    <div className="h-screen w-full relative overflow-hidden bg-black selection:bg-white/20">
      {/* 3D Model Background */}
      <div className="fixed inset-0 z-0 opacity-60">
        <LoginModel3D formProgress={formData.email ? 0.5 : 0} />
      </div>

      {/* Logo */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-30">
        <img src={logo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-end pb-[35vh] px-4 text-white">
        <div className="w-full max-w-xl space-y-12">

          <div className="text-center mb-4">
            <h1 className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase opacity-80">
              Recover Account
            </h1>
          </div>

          <div className="relative min-h-[160px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full text-center"
              >
                <span className="text-white/40 text-[10px] uppercase tracking-[0.4em] mb-6 block font-bold">
                  Identify Yourself
                </span>

                <input
                  autoFocus
                  type={activeStep.type}
                  placeholder={activeStep.placeholder}
                  value={formData[activeStep.name]}
                  onChange={(e) => setFormData({ ...formData, [activeStep.name]: e.target.value })}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 border-b-2 border-white/20 focus:border-white focus:outline-none py-6 text-3xl md:text-5xl text-white placeholder:text-white/20 transition-all text-center font-light tracking-wide lg:tracking-wider appearance-none"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="mt-14 px-16 py-4 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all tracking-widest uppercase text-sm"
                >
                  Send Reset Link
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="fixed bottom-12 left-0 w-full flex flex-col items-center gap-6 z-20">
          <Link
            className="text-white/40 hover:text-white text-xs uppercase tracking-[0.3em] transition-all border-b border-white/0 hover:border-white/20 pb-1"
            to="/auth/login"
          >
            Back to Sign In
          </Link>

          <Link
            className="p-3 rounded-full border border-white/10 hover:border-white/30 text-white/40 hover:text-white transition-all bg-white/5"
            to="/shop/home"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthForgotPassword;