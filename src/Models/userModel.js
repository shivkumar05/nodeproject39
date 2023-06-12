const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: Number, required: true, unique: true },
    join_as: { type: String, required: true },
    academy_name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    signup_as: { type: String, required: true },
    academy_id: { type: String },
    snc_id: { type: String },
    coach_id: { type: String },
    token: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
