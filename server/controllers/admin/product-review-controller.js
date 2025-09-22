const ProductReview = require("../../models/Review");

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await ProductReview.find();
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
    });
  }
};

// Get reviews for a specific product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await ProductReview.find({ productId });

    if (!reviews.length) {
      return res.status(404).json({
        success: false,
        message: "No reviews found for this product",
      });
    }

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error fetching product reviews",
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const deletedReview = await ProductReview.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error deleting review",
    });
  }
};

module.exports = { getAllReviews, getProductReviews, deleteReview };
