const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [] , sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

  

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;

        break;
      case "price-hightolow":
        sort.price = -1;

        break;
      case "title-atoz":
        sort.title = 1;

        break;

      case "title-ztoa":
        sort.title = -1;

        break;

      default:
        sort.price = 1;
        break;
    }

    const products = await Product.find(filters).sort(sort);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    // Retrieve all reviews for the product
    const reviews = await ProductReview.find({ productId: id });
    // Calculate average review value; if no reviews, default to 0
    const averageReview =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.reviewValue, 0) / reviews.length
        : 0;

    // Attach average review value to the product data
    const productData = {
      ...product.toObject(),
      averageReview,
    };

    res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };
