const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file, transformations = []) {
  const uploadOptions = {
    resource_type: "auto",
  };

  // Add transformations if provided
  if (transformations && transformations.length > 0) {
    uploadOptions.transformation = transformations;
  }

  const result = await cloudinary.uploader.upload(file, uploadOptions);
  return result;
}
const videoUploadUtil = async (videoData, transformations = []) => {
  try {
    const uploadOptions = {
      resource_type: "video", // Ensure we handle video resources
    };

    // Add transformations if provided
    if (transformations && transformations.length > 0) {
      uploadOptions.transformation = transformations;
    }

    const uploadResult = await cloudinary.uploader.upload(videoData, uploadOptions);
    return uploadResult;
  } catch (error) {
    console.error("Error uploading video: ", error);
    throw error;
  }
};

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil, videoUploadUtil };
