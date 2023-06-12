const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    userId: { type: String },
    date: { type: String },
    intensity: { type: Number },
    total_time: { type: Number },
    minutes_batted: { type: Number },
    balls_bowled: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("workout", workoutSchema);
