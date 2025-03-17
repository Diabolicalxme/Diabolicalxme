const mongoose = require("mongoose");

const InstaFeedSchema = new mongoose.Schema(
  {
    posts: {
      type: [String]
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("InstaFeed", InstaFeedSchema);
