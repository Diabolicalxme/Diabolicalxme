const User = require("../../models/User");

// Retrieve all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching users",
    });
  }
};

// Update a user's role (only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check if role is provided
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role field is required for update",
      });
    }

    // Update only the role field
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating user role",
    });
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting user",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
};