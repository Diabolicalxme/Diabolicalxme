const Newsletter = require("../../models/NewsLetter");
const sendEmail = require("../../helpers/send-email");
const { imageUploadUtil } = require("../../helpers/cloudinary");

// Get all subscribers
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: subscribers,
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscribers",
    });
  }
};

// Send emails with flyer/poster and message
const sendNewsletter = async (req, res) => {
  try {
    const { emails, flyer, message } = req.body;

    let flyerUrl = flyer;
    if (flyer) {
      const uploadedFlyer = await imageUploadUtil(flyer);
      flyerUrl = uploadedFlyer.secure_url;
    }

    // Ensure `message` is formatted correctly
    const emailContent = `
    <div style="max-width:600px; margin:0 auto; background: #fdf6f0; border: 1px solid #ddd; border-radius: 8px; padding: 20px; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <h2 style="color: #d45d79; text-align: center; margin-bottom: 10px;">Rachana Boutique</h2>
      <div style="text-align: center; margin-top: 10px;">
        <p style="font-size:16px; color:#333;">
          ${message || "Check out our latest update!"}
        </p>
        ${flyerUrl ? `<img src="${flyerUrl}" alt="Newsletter Flyer" style="max-width:100%; margin-top:10px; border-radius: 4px;" />` : ""}
      </div>
      <p style="font-size:12px; color:#777; text-align:center; margin-top:20px;">
        Thank you for being a loyal customer!
      </p>
    </div>
    `;

    const emailPromises = emails.map((email) =>
      sendEmail({
        email,
        subject: "Newsletter Update",
        message: emailContent, // Ensure the message is properly embedded
      })
    );

    await Promise.all(emailPromises);
    
    res.status(200).json({
      success: true,
      message: "Newsletter sent successfully",
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    res.status(500).json({
      success: false,
      message: "Error sending newsletter",
    });
  }
};


// Delete a subscriber
const deleteSubscriber = async (req, res) => {
  try {
    const { email } = req.params;
    const deletedSubscriber = await Newsletter.findOneAndDelete({ email });

    if (!deletedSubscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting subscriber",
    });
  }
};

module.exports = {
  getAllSubscribers,
  sendNewsletter,
  deleteSubscriber,
};
