const InstaFeed = require("../../models/InstaFeed");

const getInstaFeed = async (req, res) => {
  try {
    // Fetch all Instagram feed posts from the database
    const instaFeedPosts = await InstaFeed.find({});

    res.status(200).json({
      success: true,
      data: instaFeedPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching Instagram feed posts",
    });
  }
};

module.exports = { getInstaFeed };
