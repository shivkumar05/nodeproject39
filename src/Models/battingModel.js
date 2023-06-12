const mongoose = require("mongoose");

const battingSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    matches: { type: Number, require: true },
    runs: { type: Number, require: true },
    faced: { type: Number, require: true },
    strike_rate: { type: Number, require: true },
    fifty_hundred: { type: String, require: true },
    average: { type: Number, require: true },
    level: { type: Number, require: true },
    out: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("batting", battingSchema);
