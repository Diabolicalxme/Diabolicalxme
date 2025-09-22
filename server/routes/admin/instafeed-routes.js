const express = require("express");

const {
  createInstaFeed,
  updateInstaFeed,
  deleteInstaFeed,
  getAllInstaFeeds,
} = require("../../controllers/admin/instafeed-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();


router.post("/add", createInstaFeed);

router.put("/edit/:postUrl",updateInstaFeed);

// Route to delete an InstaFeed post by id.
router.delete("/delete/:postUrl", deleteInstaFeed);

// Route to retrieve all InstaFeed posts.
router.get("/get", getAllInstaFeeds);

module.exports = router;
