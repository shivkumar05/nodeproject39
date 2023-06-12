const mongoose = require("mongoose");

const sncPlayerProfile = new mongoose.Schema(
  {
    userId: { type: String },
    image: { type: String, require: true },
    Height: { type: Number, require: true },
    Weight: { type: Number, require: true },
    Age: { type: Number, require: true },
    Gender: { type: String, require: true },
    Sport: { type: String, require: true },
    Dominance: { type: String, require: true },
    Training_age: { type: String, require: true },
    Recent_injuries: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("sncPlayerProfile", sncPlayerProfile);
