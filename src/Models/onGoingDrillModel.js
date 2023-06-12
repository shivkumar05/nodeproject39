const mongoose = require("mongoose");

const OnGoingDrillSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    title: { type: String, require: true },
    category: { type: Number, require: true },
    repetation: { type: Number, require: true },
    sets: { type: Number, require: true },
    video: { type: String },
    comment: { type: String },
    remarks: { type: String, require: true },
    score: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnGoingDrill", OnGoingDrillSchema);
