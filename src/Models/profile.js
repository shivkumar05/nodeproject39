const mongoose = require("mongoose");

const userProfile = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    image: { type: String },
    dob: { type: String, require: true },
    gender: { type: String, require: true },
    email: { type: String, require: true },
    contact: { type: Number, require: true },
    height: { type: Number, require: true },
    weight: { type: Number, require: true },
    Sport: { type: String, require: true },
    Dominance: { type: String, require: true },
    Training_age: { type: String, require: true },
    Recent_injuries: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("userprofile", userProfile);
