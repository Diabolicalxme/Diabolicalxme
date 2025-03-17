import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo3.png";

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

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

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
  }, [
    formData.userName,
    formData.email,
    formData.password,
    formData.age,
    formData.height,
    formData.chestSize,
    formData.bodyLength,
    formData.shoulderLength
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
        toast({
          title: data?.payload?.message,
        });
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="-mt-16 mx-auto w-full max-w-md space-y-6">
      <div className="w-56 h-56 flex items-center justify-center mx-auto">
        <img src={logo} alt="Logo" className="w-full h-full" />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account?
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        disabled={!isFormValid}
      />
    </div>
  );
}

export default AuthRegister;