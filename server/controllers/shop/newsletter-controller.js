const Newsletter = require("../../models/NewsLetter");

// Create new newsletter subscription
const createSubscription = async (req, res) => {
  try {
    const { email } = req.body; // Extract email from the request

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if the email is already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed to the newsletter.",
      });
    }

    // Create a new newsletter subscription document
    const newSubscription = new Newsletter({
      email,
    });

    await newSubscription.save();

    res.status(201).json({
      success: true,
      data: newSubscription,
      message: "Subscription successful!",
    });
  } catch (error) {
    console.error("Error creating newsletter subscription:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while subscribing to the newsletter",
    });
  }
};

module.exports = {
  createSubscription,
};
