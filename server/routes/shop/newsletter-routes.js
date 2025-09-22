const express = require("express");
const { createSubscription } = require("../../controllers/shop/newsletter-controller");

const router = express.Router();

// Route to create a newsletter subscription
router.post("/subscribe", createSubscription);

module.exports = router;
