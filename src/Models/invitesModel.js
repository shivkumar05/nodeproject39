const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    userId: { type: String },
    name: { type: String },
    phone: { type: Number, require: true },
    email: { type: String, require: true },
    dob: { type: String, require: true },
    url: { type: String, require: true },
    coach_id: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("invite", inviteSchema);
