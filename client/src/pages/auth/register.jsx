import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
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

// Total number of fields to track progress
const TOTAL_FIELDS = 8;

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isFormValid, setIsFormValid] = useState(false);
  const [filledFieldsCount, setFilledFieldsCount] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setFormProgress } = useOutletContext() || {};

  // Calculate form progress and update the mannequin
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

    // Update the mannequin rotation via context or event
    const progress = count / TOTAL_FIELDS;
    if (setFormProgress) {
      setFormProgress(progress);
    } else {
      // Fallback to custom event if context is not available
      window.dispatchEvent(
        new CustomEvent('form-progress', {
          detail: { progress }
        })
      );
    }
  }, [formData, setFormProgress]);

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
        if (setFormProgress) setFormProgress(1);

        toast({
          title: data?.payload?.message,
        });

        // Short delay to show the completed mannequin rotation
        setTimeout(() => {
          navigate("/auth/login");
        }, 1000);
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  // Custom form data handler that updates the mannequin
  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

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
        <p className="mt-2 text-sm text-muted-foreground">
          {filledFieldsCount} of {TOTAL_FIELDS} fields completed
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={handleFormDataChange}
        onSubmit={onSubmit}
        disabled={!isFormValid}
      />
    </div>
  );
}

export default AuthRegister;