const mongoose = require("mongoose");

const Snc_coachSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    coach_name: { type: String, default: null },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Snc/coach", Snc_coachSchema);
