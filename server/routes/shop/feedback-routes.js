const express = require("express");
  const router = express.Router();
  const { createFeedback, getAllFeedback } = require("../../controllers/shop/feedback-controller");
  router.post("/add", createFeedback);
  router.get("/get", getAllFeedback);
  
  module.exports = router;
  