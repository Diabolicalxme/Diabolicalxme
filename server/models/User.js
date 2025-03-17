const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
  role: {
    type: String,
    default: "user",
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
