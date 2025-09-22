const express = require("express");

const { getCategories } = require("../../controllers/shop/categories-controller");

const router = express.Router();

// Route to fetch all categories
router.get("/get", getCategories);

module.exports = router;
