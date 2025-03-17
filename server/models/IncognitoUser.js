const mongoose = require("mongoose");

const IncognitoUserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  height: {
    type: Number, // in cm
    required: true,
  },
  chestSize: {
    type: Number, // in inches
    required: true,
  },
  bodyLength: {
    type: Number, // in cm
    required: true,
  },
  shoulderLength: {
    type: Number, // in cm
    required: true,
  },
  category: {
    type: String,
    enum: ["Author", "Bravo", "Hector"],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
});

const IncognitoUser = mongoose.model("IncognitoUser", IncognitoUserSchema);
module.exports = IncognitoUser;