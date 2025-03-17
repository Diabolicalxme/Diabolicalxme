const express = require("express");

  const {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
  } = require("../../controllers/admin/category-controller");

  const { upload } = require("../../helpers/cloudinary");

  const router = express.Router();

  // Route to add a new category, with optional image upload processing if file provided.
  router.post("/add", upload.single("my_file"), createCategory);

  // Route to edit a category by id, with optional image upload processing if file provided.
  router.put("/edit/:id", upload.single("my_file"), updateCategory);

  // Route to delete a category by id.
  router.delete("/delete/:id", deleteCategory);

  // Route to retrieve all categories.
  router.get("/get", getAllCategories);

  module.exports = router;