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
    comment: { type: String },
    drill_id: { type: String, require: true },
    isCompleted: { type: Boolean, default: false },
    end_date: { type: String, require: true },
    group: { type: Number, require: true },
    dates: [
      {
        date: { type: String, require: true },
        complete: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("routine", routineSchema);
