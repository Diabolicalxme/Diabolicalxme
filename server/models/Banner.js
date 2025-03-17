const mongoose = require('mongoose');

  // Define the Banner schema with fields for image and description.
  // The options object enables automatic creation and management of createdAt and updatedAt timestamps.
  const BannerSchema = new mongoose.Schema(
    {
      image: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: false,
      },
    },
    {
      timestamps: true,
    }
  );


  module.exports = mongoose.model('Banner', BannerSchema);