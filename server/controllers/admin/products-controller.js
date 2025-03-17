const { imageUploadUtil, videoUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");


// Handles image upload for both single and multiple files
const handleImageUpload = async (req, res) => {
  try {
    let results = [];
    // Check if multiple files were uploaded
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const url = "data:" + file.mimetype + ";base64," + b64;
        const result = await imageUploadUtil(url);
        results.push(result);
      }
    } else if (req.file) { // Single file upload fallback
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const url = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await imageUploadUtil(url);
      results.push(result);
    }
    return res.json({
      success: true,
      result: results,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Error occurred",
    });
  }
};

const handleVideoUpload = async (req, res) => {
  try {
    // Check if a video file was uploaded
    if (req.file) {
      // Convert the video file buffer to a base64 string
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const url = "data:" + req.file.mimetype + ";base64," + b64;
      
      // Upload the video using the videoUploadUtil (internal organization util)
      const result = await videoUploadUtil(url);
      
      return res.json({
        success: true,
        result: result
      });
    } else {
      return res.json({
        success: false,
        message: "No file uploaded"
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Error occurred"
    });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      isNewArrival,
      isFeatured,
      price,
      salePrice,
      totalStock,
      averageReview,
      colors,      
      isWatchAndBuy, 
      video      
    } = req.body;

    // Ensure that image is an array; if not, convert it to one.
    const images = Array.isArray(image) ? image : [image];
    // Ensure that colors is an array if provided; otherwise, default to an empty array.
    const colorsArray = colors ? (Array.isArray(colors) ? colors : [colors]) : [];

    const newlyCreatedProduct = new Product({
      image: images,
      title,
      description,
      category,
      isNewArrival,
      isFeatured,
      price,
      salePrice,
      totalStock,
      averageReview,
      colors: colorsArray,
      isWatchAndBuy,
      video
    });

    await newlyCreatedProduct.save();
    return res.status(201).json({
      success: true,
      data: newlyCreatedProduct
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred"
    });
  }
};

// Fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    // Retrieve all products from the database
    const listOfProducts = await Product.find({});

    // For each product, calculate the average review using parallel processing
    const productsWithAverage = await Promise.all(
      listOfProducts.map(async (product) => {
        // Find all reviews for the product using its _id
        const reviews = await ProductReview.find({ productId: product._id });

        // Compute the average reviewValue; if no reviews, default to 0
        const averageReview = reviews.length
          ? reviews.reduce((acc, review) => acc + review.reviewValue, 0) / reviews.length
          : 0;

        // Return a plain object representation with the additional averageReview field
        return { ...product.toObject(), averageReview };
      })
    );

    // Send response with the enriched product list including the average reviews
    return res.status(200).json({
      success: true,
      data: productsWithAverage,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      isNewArrival,
      isFeatured,
      price,
      salePrice,
      totalStock,
      averageReview,
      colors,        // new field: colors array
      isWatchAndBuy, // new field: boolean
      video         // new field: string
    } = req.body;

    // Ensure that image is an array; if not, convert it to one.
    const images = Array.isArray(image) ? image : [image];
    // Ensure that colors is an array if provided; otherwise, default to an empty array.
    const colorsArray = colors ? (Array.isArray(colors) ? colors : [colors]) : [];

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        image: images,
        title,
        description,
        category,
        isNewArrival,
        isFeatured,
        price,
        salePrice,
        totalStock,
        averageReview,
        colors: colorsArray,
        isWatchAndBuy,
        video
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred"
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

module.exports = {
  handleImageUpload,
  handleVideoUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};