const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: String },
    drill_id: { type: String },
    video_id: { type: String },
    timePosition: { type: Number, require: true },
    type: { type: String, require: true },
    message: { type: String, require: true },
    duration: { type: String, require: true },
    file: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("feedback", feedbackSchema);
