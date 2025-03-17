const express = require("express");
  const { upload } = require("../../helpers/cloudinary");
  const {
    createBanner,
    updateBanner,
    deleteBanner,
    getAllBanners,
  } = require("../../controllers/admin/banners-controller");

  const router = express.Router();

  // Route to add a new banner, with optional image upload processing if file provided.
  router.post("/add", upload.single("my_file"), createBanner);

  // Route to edit a banner by id, with optional image upload processing if file provided.
  router.put("/edit/:id", upload.single("my_file"), updateBanner);

  // Route to delete a banner by id.
  router.delete("/delete/:id", deleteBanner);

  // Route to retrieve all banners.
  router.get("/get", getAllBanners);

  module.exports = router;