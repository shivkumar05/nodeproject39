const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone: { type: Number },
    otp: { type: Number },
    timestamp: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OTP", otpSchema);
