const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: [String],
    title: String,
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isNewArrival: Boolean,
    isFeatured: Boolean,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    colors: [
      {
        title: String,
        image: String,
      }
    ],
    isWatchAndBuy: Boolean,
    video: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);