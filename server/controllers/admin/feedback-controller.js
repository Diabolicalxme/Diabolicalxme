const Feedback = require("../../models/Feedback");

// Retrieve a specific feedback by ID
const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }
    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching feedback",
    });
  }
};

// Delete a feedback by ID
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFeedback = await Feedback.findByIdAndDelete(id);
    if (!deletedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting feedback",
    });
  }
};

// Retrieve all feedback entries
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching feedback entries",
    });
  }
};

module.exports = {
  getFeedback,
  deleteFeedback,
  getAllFeedback,
};
