const mongoose = require("mongoose");

const academyProfile = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    image: { type: String, default: ""  },
    admin_name: { type: String, require: true },
    email: { type: String, require: true },
    contact: { type: Number, require: true },
    address: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("academyProfile", academyProfile);
