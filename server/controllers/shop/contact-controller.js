const Contact = require("../../models/Contact");

const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate that all required fields are provided
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Fields 'name', 'email', and 'message' are required",
      });
    }

    // Create a new contact document
    const newContact = new Contact({
      name,
      email,
      message
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      data: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating contact",
    });
  }
};

module.exports = {
  createContact
};