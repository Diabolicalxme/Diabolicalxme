const express = require("express");
const router = express.Router();

// Import user controller functions
const { getAllUsers, updateUser, deleteUser } = require("../../controllers/admin/user-controller");

// Route to retrieve all users
router.get("/get", getAllUsers);

// Route to update a user's role (only)
router.put("/update/:id", updateUser);

// Route to delete a specific user by ID
router.delete("/delete/:id", deleteUser);

module.exports = router;