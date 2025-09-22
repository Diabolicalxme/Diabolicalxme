const Feedback = require("../../models/Feedback");

  // Create new feedback entry
  const createFeedback = async (req, res) => {
    try {
      const { feedback, userName, email } = req.body; // Extract user details from the request
  
      if (!feedback || !userName || !email) {
        return res.status(400).json({
          success: false,
          message: "Feedback, userName, and email are required",
        });
      }
  
      // Create a new feedback document
      const newFeedback = new Feedback({
        user: userName, // Store the user's name
        feedback,
        email, // Store the user's email
      });
  
      await newFeedback.save();
  
      res.status(201).json({
        success: true,
        data: newFeedback,
      });
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({
        success: false,
        message: "Error occurred while creating feedback",
      });
    }
  };
  
  

  // Retrieve all feedback entries
  const getAllFeedback = async (req, res) => {
    try {
      const feedbackList = await Feedback.find({}).populate("user", "username email");
      res.status(200).json({
        success: true,
        data: feedbackList,
      });
    } catch (error) {
      console.error("Error fetching feedback entries:", error);
      res.status(500).json({
        success: false,
        message: "Error occurred while fetching feedback entries",
      });
    }
  };

  module.exports = {
    createFeedback,
    getAllFeedback,
  };