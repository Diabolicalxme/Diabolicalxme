import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFeedback } from "@/store/shop/feedback-slice";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

const FeedbackCard = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Access user and authentication state
  const { user, isAuthenticated } = useSelector((state) => state.auth);

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
        <button className="px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Share Your Experience</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-light uppercase tracking-wide text-center">Share Your Experience</DialogTitle>
          <div className="w-16 h-0.5 bg-black mx-auto mt-2 mb-4"></div>
          <p className="text-center text-gray-500 text-sm">
            We value your feedback. Tell us about your experience with our products and services.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <Textarea
            name="feedback"
            placeholder="Enter your feedback here"
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            rows={6}
            className="border-gray-300 focus:border-black focus:ring-black resize-none"
          />
          <DialogFooter className="mt-6">
            <button
              type="submit"
              className="w-full px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
            >
              Submit Feedback
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackCard;