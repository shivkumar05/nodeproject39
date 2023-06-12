const mongoose = require("mongoose");

const readinessSurvey = new mongoose.Schema(
  {
    userId: { type: String },
    date: { type: String, require: true },
    Sleep: { type: Number, require: true },
    Mood: { type: Number, require: true },
    Energy: { type: Number, require: true },
    Stressed: { type: Number, require: true },
    Sore: { type: Number, require: true },
    Heart_rate: { type: Number, require: true },
    Urine_color: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("readinessSurvey", readinessSurvey);
