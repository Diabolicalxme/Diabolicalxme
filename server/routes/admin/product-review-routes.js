const express = require("express");
const { getAllReviews, getProductReviews, deleteReview } = require("../../controllers/admin/product-review-controller");

const router = express.Router();

router.get("/", getAllReviews);

router.get("/:productId", getProductReviews);

router.delete("/:reviewId", deleteReview);

module.exports = router;
