const Banner = require("../../models/Banner");

const getBanners = async (req, res) => {
  try {
    // Fetch all banners from the database
    const banners = await Banner.find({});

    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching banners",
    });
  }
};

module.exports = { getBanners };
