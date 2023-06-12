const mongoose = require("mongoose");

const scoreAndremarkSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    drill_id: { type: String, require: true },
    remarks: { type: String, require: true },
    score: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("scoreAndremark", scoreAndremarkSchema);
