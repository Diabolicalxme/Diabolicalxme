const { imageUploadUtil, videoUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");
const sharp = require("sharp");

// Handles image upload for both single and multiple files
/* const handleImageUpload = async (req, res) => {
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
}; */


const handleImageUpload = async (req, res) => {
  try {
    let results = [];

    // Define supported input formats
    const supportedInputFormats = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
      'image/webp', 'image/avif', 'image/tiff', 'image/bmp',
      'image/svg+xml', 'image/heic', 'image/heif'
    ];

    const processImage = async (file) => {
      // Validate file type
      if (!file.mimetype || !supportedInputFormats.includes(file.mimetype.toLowerCase())) {
        throw new Error(`Unsupported file format: ${file.mimetype || 'unknown'}`);
      }

      // Validate file size (optional - adjust as needed)
      const maxFileSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxFileSize) {
        throw new Error(`File too large: ${file.size} bytes. Maximum allowed: ${maxFileSize} bytes`);
      }

      let outputFormat = "avif"; // Default to AVIF
      let quality = 90;

      // Determine best output format based on input and browser support
      const getOptimalFormat = (inputMimetype) => {
        // For animations (GIF), preserve as WebP to maintain animation
        if (inputMimetype === 'image/gif') {
          return { format: 'webp', quality: 80, animated: true };
        }
        
        // For vector graphics, convert to PNG to maintain quality
        if (inputMimetype === 'image/svg+xml') {
          return { format: 'png', quality: 100 };
        }

        // For photos, use AVIF for best compression, fallback to WebP
        return { format: 'avif', quality: 90 };
      };

      const formatConfig = getOptimalFormat(file.mimetype);
      outputFormat = formatConfig.format;
      quality = formatConfig.quality;

      // Handle different Sharp processing based on input format
      let sharpInstance = sharp(file.buffer);

      // Special handling for different input formats
      if (file.mimetype === 'image/heic' || file.mimetype === 'image/heif') {
        // HEIC/HEIF might need special handling
        sharpInstance = sharp(file.buffer, { pages: -1 });
      }

      if (file.mimetype === 'image/gif' && formatConfig.animated) {
        // Preserve animation for GIFs
        sharpInstance = sharp(file.buffer, { animated: true });
      }

      // Apply transformations
      let processedImage = sharpInstance
        .resize({ 
          width: 1024, 
          height: 1024, 
          fit: 'inside', // Maintain aspect ratio
          withoutEnlargement: true // Don't upscale smaller images
        })
        .rotate(); // Auto-rotate based on EXIF data

      // Apply format-specific options
      switch (outputFormat) {
        case 'avif':
          processedImage = processedImage.avif({ 
            quality, 
            effort: 6 // Higher effort for better compression
          });
          break;
        case 'webp':
          processedImage = processedImage.webp({ 
            quality,
            effort: 6,
            animated: formatConfig.animated || false
          });
          break;
        case 'jpeg':
          processedImage = processedImage.jpeg({ 
            quality,
            progressive: true,
            mozjpeg: true // Use mozjpeg encoder for better compression
          });
          break;
        case 'png':
          processedImage = processedImage.png({ 
            quality,
            progressive: true,
            compressionLevel: 9
          });
          break;
        default:
          // Fallback to JPEG
          outputFormat = 'jpeg';
          processedImage = processedImage.jpeg({ quality: 90 });
      }

      try {
        const compressedBuffer = await processedImage.toBuffer();
        const b64 = compressedBuffer.toString("base64");
        const url = `data:image/${outputFormat};base64,${b64}`;
        
        return await imageUploadUtil(url);
      } catch (sharpError) {
        // If Sharp fails with the chosen format, fallback to JPEG
        console.warn(`Failed to process as ${outputFormat}, falling back to JPEG:`, sharpError.message);
        
        const fallbackBuffer = await sharp(file.buffer)
          .resize({ width: 1024, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer();
        
        const b64 = fallbackBuffer.toString("base64");
        const url = `data:image/jpeg;base64,${b64}`;
        
        return await imageUploadUtil(url);
      }
    };

    // Validate that files exist
    const filesToProcess = [];
    
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      filesToProcess.push(...req.files);
    } else if (req.file) {
      filesToProcess.push(req.file);
    } else {
      return res.status(400).json({
        success: false,
        message: "No files provided for upload"
      });
    }

    // Process all files
    const processPromises = filesToProcess.map(async (file, index) => {
      try {
        return await processImage(file);
      } catch (fileError) {
        console.error(`Error processing file ${index + 1}:`, fileError);
        return {
          error: true,
          message: fileError.message,
          filename: file.originalname || `file_${index + 1}`
        };
      }
    });

    results = await Promise.all(processPromises);

    // Check if any files failed to process
    const errors = results.filter(result => result && result.error);
    const successes = results.filter(result => result && !result.error);

    if (errors.length > 0 && successes.length === 0) {
      // All files failed
      return res.status(400).json({
        success: false,
        message: "All files failed to process",
        errors: errors
      });
    }

    return res.json({
      success: true,
      result: successes,
      ...(errors.length > 0 && { 
        warnings: `${errors.length} file(s) failed to process`,
        failed_files: errors 
      })
    });

  } catch (error) {
    console.error("Image upload handler error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred during image processing",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// const handleVideoUpload = async (req, res) => {
//   try {
//     // Check if a video file was uploaded
//     if (req.file) {
//       // Convert the video file buffer to a base64 string
//       const b64 = Buffer.from(req.file.buffer).toString("base64");
//       const url = "data:" + req.file.mimetype + ";base64," + b64;

//       // Upload without transformations - we'll apply them at delivery time
//       const result = await videoUploadUtil(url);

//       return res.json({
//         success: true,
//         result: result
//       });
//     } else {
//       return res.json({
//         success: false,
//         message: "No file uploaded"
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.json({
//       success: false,
//       message: "Error occurred"
//     });
//   }
// };

// Add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      secondTitle,
      productCode,
      category,
      isNewArrival,
      isFeatured,
      price,
      salePrice,
      totalStock,
      averageReview,
      colors,
      // isWatchAndBuy,
      // video
    } = req.body;

    // Ensure that image is an array; if not, convert it to one.
    const images = Array.isArray(image) ? image : [image];
    // Ensure that colors is an array if provided; otherwise, default to an empty array.
    const colorsArray = colors ? (Array.isArray(colors) ? colors : [colors]) : [];

    // Validate color inventory doesn't exceed total stock
    if (colorsArray.length > 0) {
      const totalColorInventory = colorsArray.reduce((sum, color) => sum + (color.inventory || 0), 0);
      if (totalColorInventory > totalStock) {
        return res.status(400).json({
          success: false,
          message: "Total color inventory cannot exceed total stock"
        });
      }
    }

    const newlyCreatedProduct = new Product({
      image: images,
      title,
      description,
      secondTitle,
      productCode,
      category,
      isNewArrival,
      isFeatured,
      price,
      salePrice,
      totalStock,
      averageReview,
      colors: colorsArray,
      // isWatchAndBuy,
      // video
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
      secondTitle,
      productCode,
      category,
      isNewArrival,
      isFeatured,
      price,
      salePrice,
      totalStock,
      averageReview,
      colors,        // new field: colors array
      // isWatchAndBuy, // new field: boolean
      // video         // new field: string
    } = req.body;

    // Ensure that image is an array; if not, convert it to one.
    const images = Array.isArray(image) ? image : [image];
    // Ensure that colors is an array if provided; otherwise, default to an empty array.
    const colorsArray = colors ? (Array.isArray(colors) ? colors : [colors]) : [];

    // Validate color inventory doesn't exceed total stock
    if (colorsArray.length > 0) {
      const totalColorInventory = colorsArray.reduce((sum, color) => sum + (color.inventory || 0), 0);
      if (totalColorInventory > totalStock) {
        return res.status(400).json({
          success: false,
          message: "Total color inventory cannot exceed total stock"
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        image: images,
        title,
        description,
        secondTitle,
        productCode,
        category,
        isNewArrival,
        isFeatured,
        price,
        salePrice,
        totalStock,
        averageReview,
        colors: colorsArray,
        // isWatchAndBuy,
        // video
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
  // handleVideoUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};