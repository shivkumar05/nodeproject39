const mongoose = require("mongoose");

const sessionAndExerciseSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    session_id: { type: Number, require: true },
    Exercise_id: { type: Number, require: true },
    Exercise_title: { type: String, require: true },
    Set: { type: Number, require: true },
    Reps: { type: Number, require: true },
    Load_Unit: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("sessionAndExercise", sessionAndExerciseSchema);

