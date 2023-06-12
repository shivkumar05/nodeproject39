const mongoose = require("mongoose");

const DrillSchema = new mongoose.Schema(
  {
    title: { type: String, require: true },
    category: { type: Number, require: true },
    repetation: { type: Number, require: true },
    sets: { type: Number, require: true },
    video: { type: String },
    thumbnail: { type: String },
    videoLength: { type: String },
    userId: { type: String },
    comment: { type: String },
    isCompleted: { type: Boolean, default: false },
    routine_id: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MyDrill", DrillSchema);
