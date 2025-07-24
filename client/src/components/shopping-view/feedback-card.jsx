import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFeedback } from "@/store/shop/feedback-slice";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";

const FeedbackCard = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Access user and authentication state
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Get theme-aware colors
  const getThemeColors = () => {
    if (!user?.category) {
      return {
        buttonBg: 'border-foreground hover:bg-foreground hover:text-background',
        textColor: 'text-foreground',
        mutedText: 'text-muted-foreground',
        dividerBg: 'bg-foreground',
        inputBorder: 'border-border focus:border-foreground focus:ring-foreground'
      };
    }

    switch (user.category.toLowerCase()) {
      case 'author':
        return {
          buttonBg: 'border-[#C2B280] hover:bg-[#C2B280] hover:text-white text-[#333333]',
          textColor: 'text-[#333333]',
          mutedText: 'text-[#666666]',
          dividerBg: 'bg-[#C2B280]',
          inputBorder: 'border-[#D6CCA9] focus:border-[#C2B280] focus:ring-[#C2B280]'
        };
      case 'bravo':
        return {
          buttonBg: 'border-gray-800 hover:bg-gray-800 hover:text-white text-white',
          textColor: 'text-white',
          mutedText: 'text-gray-300',
          dividerBg: 'bg-gray-800',
          inputBorder: 'border-gray-700 focus:border-gray-800 focus:ring-gray-800'
        };
      case 'hector':
        return {
          buttonBg: 'border-[#106840] hover:bg-[#106840] hover:text-white text-white',
          textColor: 'text-white',
          mutedText: 'text-green-200',
          dividerBg: 'bg-[#106840]',
          inputBorder: 'border-[#106840] focus:border-[#0E5A38] focus:ring-[#0E5A38]'
        };
      default:
        return {
          buttonBg: 'border-foreground hover:bg-foreground hover:text-background',
          textColor: 'text-foreground',
          mutedText: 'text-muted-foreground',
          dividerBg: 'bg-foreground',
          inputBorder: 'border-border focus:border-foreground focus:ring-foreground'
        };
    }
  };

  const themeColors = getThemeColors();

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
        <button className={`px-6 py-3 border-2 ${themeColors.buttonBg} transition-colors duration-300 uppercase tracking-wider text-sm font-medium flex items-center gap-2`}>
          <MessageSquare className="h-4 w-4" />
          <span>Share Your Experience</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[90%] md:w-[80vw] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold mb-4 text-center ${themeColors.textColor}`}>Share Your Experience</DialogTitle>
          <div className={`w-16 h-0.5 ${themeColors.dividerBg} mx-auto mt-2 mb-4`}></div>
          <p className={`text-center ${themeColors.mutedText} text-sm leading-relaxed`}>
            We value your feedback. Tell us about your experience with our products and services.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="feedback" className={`block text-sm font-medium ${themeColors.textColor} mb-2`}>
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
                className={`${themeColors.inputBorder} resize-none bg-background text-foreground placeholder:text-muted-foreground`}
              />
            </div>
            
            <div className={`p-4 rounded-lg bg-muted/10 border ${themeColors.inputBorder.split(' ')[0]}`}>
              <p className={`text-xs ${themeColors.mutedText} leading-relaxed`}>
                <strong className={themeColors.textColor}>Note:</strong> Your feedback helps us improve our products and services. 
                We may use your comments to enhance our offerings and customer experience.
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-8">
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`flex-1 px-6 py-3 border-2 border-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/10 transition-colors duration-300 uppercase tracking-wider text-sm font-medium`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 border-2 ${themeColors.buttonBg} transition-colors duration-300 uppercase tracking-wider text-sm font-medium`}
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