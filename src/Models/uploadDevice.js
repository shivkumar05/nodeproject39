const mongoose = require("mongoose");

const uploadDeviceSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    video: { type: String },
    thumbnail: { type: String, require: true },
    videoLength: { type: String },
    title: { type: String, require: true },
    category: { type: Number, require: true },
    tag: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("uploadDevice", uploadDeviceSchema);
