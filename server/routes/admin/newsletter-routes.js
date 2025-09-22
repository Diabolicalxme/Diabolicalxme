const express = require("express");
const router = express.Router();
const {
  getAllSubscribers,
  sendNewsletter,
  deleteSubscriber,
} = require("../../controllers/admin/newsletter-controller");

// Route to get all subscribers
router.get("/subscribers", getAllSubscribers);

// Route to send newsletter (emails + optional flyer/poster)
router.post("/send", sendNewsletter);

// Route to delete a subscriber by email
router.delete("/unsubscribe/:email", deleteSubscriber);

module.exports = router;
