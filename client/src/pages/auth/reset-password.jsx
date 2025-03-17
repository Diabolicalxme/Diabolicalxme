import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { resetPassword } from "@/store/auth-slice";
import { useSearchParams, useNavigate } from "react-router-dom";

const initialState = {
  newPassword: "",
  confirmPassword: "",
};

function AuthResetPassword() {
  const [formData, setFormData] = useState(initialState);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  function onSubmit(event) {
    event.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    dispatch(resetPassword({ token, newPassword: formData.newPassword })).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Password reset successful!",
          description: "You can now log in with your new password.",
        });

        // Redirect to login page after a short delay
        setTimeout(() => navigate("/auth/login"), 1500);
      } else {
        toast({
          title: "Failed to reset password.",
          description: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset Your Password
        </h1>
        <p className="mt-2">
          Enter your new password below to reset your account.
        </p>
      </div>
      <CommonForm
        formControls={[
          {
            name: "newPassword",
            type: "password",
            componentType: "password",
            label: "New Password",
            placeholder: "Enter your new password",
            required: true,
          },
          {
            name: "confirmPassword",
            type: "password",
            label: "Confirm Password",
            componentType: "password",
            placeholder: "Re-enter your new password",
            required: true,
          },
        ]}
        buttonText={"Reset Password"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthResetPassword;
