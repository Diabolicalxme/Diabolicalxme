import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "@/store/auth-slice";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import LoginModel3D from "@/components/auth/LoginModel3D";
import logo from "@/assets/logo.png";
import { Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialState = {
  newPassword: "",
  confirmPassword: "",
};

const STEPS = [
  {
    name: "newPassword",
    label: "New Password",
    placeholder: "Enter new password",
    type: "password"
  },
  {
    name: "confirmPassword",
    label: "Verify Password",
    placeholder: "Re-enter new password",
    type: "password"
  }
];

const TOTAL_STEPS = STEPS.length;

function AuthResetPassword() {
  const [formData, setFormData] = useState(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const formProgress = currentStep / (TOTAL_STEPS - 1);

  const handleNext = () => {
    const activeStep = STEPS[currentStep];
    const value = formData[activeStep.name];

    if (!value || !value.trim()) {
      toast({ title: `${activeStep.label} Required`, variant: "destructive" });
      return;
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  function onSubmit(event) {
    if (event) event.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords mismatch",
        description: "Please make sure passwords match.",
        variant: "destructive",
      });
      // Reset back to confirm password step
      setCurrentStep(1);
      return;
    }

    dispatch(resetPassword({ token, newPassword: formData.newPassword })).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully reset.",
        });
        setTimeout(() => navigate("/auth/login"), 2000);
      } else {
        toast({
          title: "Update Failed",
          description: data?.payload?.message || "Failed to reset password.",
          variant: "destructive",
        });
      }
    });
  }

  const activeStep = STEPS[currentStep];

  return (
    <div className="h-screen w-full relative overflow-hidden bg-black text-white">
      {/* 3D Model Background */}
      <div className="fixed inset-0 z-0 opacity-60">
        <LoginModel3D formProgress={formProgress} />
      </div>

      {/* Logo */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-30">
        <img src={logo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-end pb-[35vh] px-4">
        <div className="w-full max-w-xl space-y-12">

          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase opacity-80">
              Reset Password
            </h1>
          </div>

          <div className="relative min-h-[160px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full text-center"
              >
                <div className="mb-6">
                  <span className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold">
                    Step {currentStep + 1} of {TOTAL_STEPS} — {activeStep.label}
                  </span>
                </div>

                <input
                  autoFocus
                  type={activeStep.type}
                  placeholder={activeStep.placeholder}
                  value={formData[activeStep.name]}
                  onChange={(e) => setFormData({ ...formData, [activeStep.name]: e.target.value })}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 border-b-2 border-white/20 focus:border-white focus:outline-none py-6 text-3xl md:text-5xl text-white placeholder:text-white/20 transition-all text-center font-light tracking-wide lg:tracking-wider appearance-none"
                />

                <div className="mt-12 flex justify-center gap-8 items-center">
                  {currentStep > 0 && (
                    <button
                      onClick={handleBack}
                      className="text-white/50 hover:text-white transition-colors text-xs uppercase tracking-[0.3em]"
                    >
                      Back
                    </button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="px-12 py-3 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all tracking-widest uppercase text-sm"
                  >
                    {currentStep === TOTAL_STEPS - 1 ? "Save Password" : "Next"}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-12 left-0 w-full flex flex-col items-center gap-6 z-20">
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

export default AuthResetPassword;
