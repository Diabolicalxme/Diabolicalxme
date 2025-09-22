const { imageUploadUtil } = require("../../helpers/cloudinary");
const Banner = require("../../models/Banner");

// Create a new banner
const createBanner = async (req, res) => {
  try {
    // Extract image and description from the request body
    const { image, description } = req.body;
    
    // Optionally, you can use imageUploadUtil if you need to upload the image
    // Example (uncomment if required):
    // const uploadedImage = await imageUploadUtil(image);
    // const bannerImage = uploadedImage.secure_url || image;
    
    const newBanner = new Banner({
      image,
      description
    });

    const savedBanner = await newBanner.save();
    res.status(201).json({
      success: true,
      data: savedBanner,
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating banner",
    });
  }
};

// Update an existing banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, description } = req.body;

    // Optionally, use imageUploadUtil for image processing if needed.

    let updateData = { image, description };

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating banner",
    });
  }
};

// Delete a banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBanner = await Banner.findByIdAndDelete(id);
    if (!deletedBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting banner",
    });
  }
};

// Retrieve all banners
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching banners",
    });
  }
};

module.exports = {
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
};