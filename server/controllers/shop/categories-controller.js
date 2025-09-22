const Category = require("../../models/Category");


const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching categories",
    });
  }
};

module.exports = { getCategories };
