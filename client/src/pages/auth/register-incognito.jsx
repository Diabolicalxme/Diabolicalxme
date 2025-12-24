import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerIncognitoUser, loginAsIncognitoUser } from "@/store/auth-slice";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import RegisterModel3D from "@/components/auth/RegisterModel3D";
import logo from "@/assets/logo.png";
import { Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const STEPS = [
  { name: "userName", label: "Friend's Name", placeholder: "Enter their name", type: "text" },
  { name: "email", label: "Friend's Email", placeholder: "Their email address", type: "email" },
  { name: "password", label: "Temporary Password", placeholder: "Assign a password", type: "password" },
  { name: "age", label: "Age", placeholder: "Their age", type: "number" },
  { name: "height", label: "Height (cm)", placeholder: "Height in cm", type: "number" },
  { name: "chestSize", label: "Chest Size (in)", placeholder: "Chest size in inches", type: "number" },
  { name: "bodyLength", label: "Body Length (cm)", placeholder: "Body length in cm", type: "number" },
  { name: "shoulderLength", label: "Shoulder Length (cm)", placeholder: "Shoulder length in cm", type: "number" },
];

const TOTAL_STEPS = STEPS.length;

function RegisterIncognitoUser() {
  const [formData, setFormData] = useState(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQuote, setShowQuote] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);


  const quotes = [
    "\"Fashion is the armor to survive the reality of everyday life.\"",
    "\"Style is a way to say who you are without having to speak.\"",
    "\"The joy of dressing is an art.\"",
    "\"Elegance is the only beauty that never fades.\"",
    "\"Dress like you’re already famous.\""
  ];

  const randomQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], [showQuote]);

  const formProgress = currentStep / (TOTAL_STEPS - 1);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to register an incognito user.",
        variant: "destructive",
      });
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate, toast]);

  const handleNext = () => {
    const activeStep = STEPS[currentStep];
    const value = formData[activeStep.name];

    if (!value || (typeof value === 'string' && !value.trim())) {
      toast({ title: `${activeStep.label} Required`, variant: "destructive" });
      return;
    }

    if (activeStep.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({ title: "Invalid Email", variant: "destructive" });
      return;
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

  function onSubmit(event) {
    if (event) event.preventDefault();

    const isFullValid = STEPS.every(step => {
      const val = formData[step.name];
      return val && (typeof val === 'string' ? val.trim() : true);
    });

    if (!isFullValid) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all fields before registering.",
        variant: "destructive",
      });
      return;
    }

    const processedFormData = {
      ...formData,
      age: Number(formData.age),
      height: Number(formData.height),
      chestSize: Number(formData.chestSize),
      bodyLength: Number(formData.bodyLength),
      shoulderLength: Number(formData.shoulderLength),
    };

    dispatch(registerIncognitoUser(processedFormData)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: data?.payload?.message });

        // Mark flow as completed and show quote screen
        setRegistrationCompleted(true);
        setShowQuote(true);

        // Auto-login as the new incognito user
        const newUserId = data?.payload?.incognitoUserId || data?.payload?.user?._id;

        // Start fade out after 4 seconds
        setTimeout(() => {
          setShowQuote(false);
        }, 4000);

        // After quote completes (4s display + 1s fade out), login and navigate
        setTimeout(() => {
          if (newUserId) {
            dispatch(loginAsIncognitoUser(newUserId)).then(() => {
              navigate("/shop/home");
            });
          } else {
            navigate("/shop/home");
          }
        }, 5000);
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  const activeStep = STEPS[currentStep];

  return (
    <div className={`h-screen w-full relative overflow-hidden ${(showQuote || registrationCompleted) ? 'bg-black' : 'bg-transparent'}`}>
      {/* Quote Overlay - Must be on top of everything */}
      <AnimatePresence>
        {showQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center"
            >
              <h2 className="text-white text-3xl md:text-5xl font-light italic tracking-widest leading-relaxed drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                {randomQuote}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide everything else when quote is showing */}
      {!showQuote && !registrationCompleted && (
        <>      {/* 3D Model Background */}
          <div className="fixed inset-0 z-0">
            <RegisterModel3D formProgress={formProgress} />
          </div>

          {/* Logo */}
          <div className="fixed top-8 right-4 md:right-8 z-30">
            <img src={logo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl" />
          </div>

          {/* Main Content Overlay */}
          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center translate-y-8 pb-[20vh] px-4">
            <div className="w-full max-w-xl space-y-12">

              <div className="relative min-h-[160px] flex flex-col items-center justify-center">
                {/* Step Label */}
                <span className="text-white/40 text-[10px] uppercase tracking-[0.4em] mb-4 font-bold">
                  Register a Friend — Step {currentStep + 1} of {TOTAL_STEPS}
                </span>

                <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500 text-center">
                  <input
                    key={activeStep.name}
                    autoFocus
                    type={activeStep.type}
                    placeholder={activeStep.placeholder}
                    value={formData[activeStep.name]}
                    onChange={(e) => setFormData({ ...formData, [activeStep.name]: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-0 border-b-2 border-white/20 focus:border-white focus:outline-none py-4 text-3xl md:text-5xl text-white placeholder:text-white/30 transition-all text-center font-light tracking-wide lg:tracking-wider appearance-none"
                  />

                  {currentStep === TOTAL_STEPS - 1 && (
                    <button
                      onClick={onSubmit}
                      disabled={!formData[activeStep.name]}
                      className="mt-12 px-12 py-3 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all disabled:opacity-50 tracking-widest uppercase text-sm"
                    >
                      Register Friend
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-center items-center gap-16 pt-4">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="text-white/50 hover:text-white transition-colors text-xs uppercase tracking-[0.3em]"
                  >
                    Previous
                  </button>
                )}

                {currentStep < TOTAL_STEPS - 1 && (
                  <button
                    onClick={handleNext}
                    className="text-white hover:text-white/80 transition-colors text-xs uppercase tracking-[0.3em] font-bold"
                  >
                    Next Step
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-12 left-0 w-full flex flex-col items-center gap-4 z-20">
              <Link
                className="text-white/40 hover:text-white transition-all p-2 rounded-full border border-white/10 hover:border-white/30"
                to="/shop/home"
              >
                <Home className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RegisterIncognitoUser;
