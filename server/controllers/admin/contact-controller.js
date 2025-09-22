const Contact = require("../../models/Contact");

  const deleteContact = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Contact ID is required for deletion.",
        });
      }

      const deletedContact = await Contact.findByIdAndDelete(id);

      if (!deletedContact) {
        return res.status(404).json({
          success: false,
          message: "Contact not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Contact deleted successfully.",
        data: deletedContact,
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while deleting contact.",
      });
    }
  };

  const getAllContacts = async (req, res) => {
    try {
      const contacts = await Contact.find({});
      return res.status(200).json({
        success: true,
        data: contacts,
      });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while fetching contacts.",
      });
    }
  };

  module.exports = {
    deleteContact,
    getAllContacts,
  };