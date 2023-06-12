const mongoose = require("mongoose");

const bow_batSchema = new mongoose.Schema(
  {
    userId: { type: String },
    bat_hand: { type: String },
    bowl_hand: { type: String },
    batting_order: { type: String },
    bowling_order: { type: String },
    bowler_skill: { type: [String] },
    wicket_keeper: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bow_bat", bow_batSchema);
