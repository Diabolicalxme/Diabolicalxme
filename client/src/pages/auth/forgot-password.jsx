import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { forgotPassword } from "@/store/auth-slice";
import logo from "@/assets/logo3.png";


const initialState = {
  email: "",
};

function AuthForgotPassword() {
  const [formData, setFormData] = useState(initialState);
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();

  // Validate the form: email must not be empty
  useEffect(() => {
    if (formData.email.trim()) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formData.email]);

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

  return (
    <div className="-mt-36 mx-auto w-full max-w-xs space-y-6">
       <div className="w-56 h-56 flex items-center justify-center mx-auto">
                    <img src={logo} alt="Logo" className="w-full h-full" />
                  </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Forgot Password?
        </h1>
        <p className="mt-2">
          Enter your email address, and we'll send you password reset instructions.
        </p>
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
        setFormData={setFormData}
        onSubmit={onSubmit}
        disabled={!isFormValid}
      />
    </div>
  );
}

export default AuthForgotPassword;