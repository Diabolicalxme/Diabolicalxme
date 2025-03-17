const express = require("express");
const router = express.Router();

// Import feedback controller functions
const { getFeedback, deleteFeedback, getAllFeedback } = require("../../controllers/admin/feedback-controller");

// Route to retrieve all feedback entries
router.get("/get", getAllFeedback);

// Route to delete a specific feedback by ID
router.delete("/delete/:id", deleteFeedback);

// Route to retrieve a specific feedback by ID
router.get("/:id", getFeedback);

module.exports = router;
