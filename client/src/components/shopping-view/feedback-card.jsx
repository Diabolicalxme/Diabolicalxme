import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFeedback } from "@/store/shop/feedback-slice";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { getThemeColors } from "@/utils/theme-utils";

const FeedbackCard = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Access user and authentication state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currentTheme } = useSelector((state) => state.theme);

  const themeColors = getThemeColors(currentTheme);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to submit feedback.",
      });
      return;
    }

    try {
      // Dispatch the createFeedback action with feedback, username, and email
      await dispatch(
        createFeedback({
          feedback,
          userName: user.userName,
          email: user.email,
        })
      ).unwrap();

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      setFeedback("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your feedback.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={`px-6 py-3 border-2 ${themeColors.buttonOutline} transition-colors duration-300 uppercase tracking-wider text-sm font-medium flex items-center gap-2`}>
          <MessageSquare className="h-4 w-4" />
          <span>Share Your Experience</span>
        </button>
      </DialogTrigger>
      <DialogContent className={`w-[90%] md:w-[50vw] ${themeColors.dialogBg} ${themeColors.dialogText} border ${themeColors.borderColor}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold mb-4 text-center ${themeColors.cardText}`}>Share Your Experience</DialogTitle>
          <div className={`w-16 h-0.5 ${themeColors.dividerBg} mx-auto mt-2 mb-4`}></div>
          <p className={`text-center ${themeColors.mutedText} text-sm leading-relaxed`}>
            We value your feedback. Tell us about your experience with our products and services.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="feedback" className={`block text-sm font-medium ${themeColors.cardText} mb-2`}>
                Your Feedback
              </label>
              <Textarea
                name="feedback"
                placeholder="Share your thoughts about our products, service, or overall experience..."
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                rows={8}
                className={`${themeColors.inputBorder} resize-none ${themeColors.dialogBg} ${themeColors.dialogText} placeholder:${themeColors.mutedText}`}
              />
            </div>

            <div className={`p-4 rounded-lg ${themeColors.dialogBg} border ${themeColors.borderColor} opacity-80`}>
              <p className={`text-xs ${themeColors.mutedText} leading-relaxed`}>
                <strong className={themeColors.cardText}>Note:</strong> Your feedback helps us improve our products and services.
                We may use your comments to enhance our offerings and customer experience.
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-8">
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`flex-1 px-6 py-3 border-2 ${themeColors.borderColor} ${themeColors.mutedText} ${themeColors.hoverBg} transition-colors duration-300 uppercase tracking-wider text-sm font-medium`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 border-2 ${themeColors.buttonBg} ${themeColors.buttonText} transition-colors duration-300 uppercase tracking-wider text-sm font-medium`}
              >
                Submit Feedback
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackCard;