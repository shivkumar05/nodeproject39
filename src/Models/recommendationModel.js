const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    userId: { type: String },
    videoId: { type: String },
    anecdote_no: { type: Number, required: true },
    message: { type: String, required: true },
    audioFile: [{ type: String, required: true }],
    audiolength: { type: String, required: true },
    createdat: { type: String, require: true },
    manual: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", RecommendationSchema);
