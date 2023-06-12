const mongoose = require("mongoose");

const academy_coachSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    join_as: { type: String, required: true },
    academy_name: { type: String, default: null },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Academy/coach", academy_coachSchema);
