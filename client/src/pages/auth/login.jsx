import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import logo from "@/assets/logo3.png";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Validate the form: both email and password must be provided
  useEffect(() => {
    if (formData.email.trim() && formData.password.trim()) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formData.email, formData.password]);

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

  return (
    <div className="-mt-20 mx-auto w-full max-w-xs space-y-6">
      <div className="w-56 h-56 flex items-center justify-center mx-auto">
        <img src={logo} alt="Logo" className="w-full h-full" />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don't have an account?
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>

      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        // Disable the submit/login button if the form isn't valid
        disabled={!isFormValid}
      />
      <div className="text-center">
        <Link className="text-sm text-primary hover:underline" to="/auth/forgot-password">
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}

export default AuthLogin;