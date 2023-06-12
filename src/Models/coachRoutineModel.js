const mongoose = require("mongoose");

const routineSchema = new mongoose.Schema(
  {
    userId: { type: String },
    routineId: { type: String },
    drills: { type: String, require: true },
    date: { type: String, require: true },
    time: { type: String, require: true },
    category: { type: Number, require: true },
    repetation: { type: Number, require: true },
    sets: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("coachRoutineSchema", routineSchema);
