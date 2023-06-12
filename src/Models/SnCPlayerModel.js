const mongoose = require("mongoose");

const SnCPlayerSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: Number, required: true, unique: true },
    join_as: { type: String, require: true },
    join_for: { type: String, require: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SnCPlayer", SnCPlayerSchema);

