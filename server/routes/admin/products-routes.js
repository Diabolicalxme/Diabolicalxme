const express = require("express");

const {
  handleImageUpload,
  handleVideoUpload,
  addProduct,
  editProduct,
  fetchAllProducts, 
  deleteProduct,
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();
//aloow single or miltiple file upload
router.post("/upload-image", upload.array("my_file"), handleImageUpload);
router.post("/upload-video", upload.single("my_file"), handleVideoUpload);
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

module.exports = router;
