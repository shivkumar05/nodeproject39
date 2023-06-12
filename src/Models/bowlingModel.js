const mongoose = require("mongoose");

const bowlingSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    matches: { type: Number, require: true },
    overs: { type: Number, require: true },
    wickets: { type: Number, require: true },
    conced: { type: Number, require: true },
    average: { type: Number, require: true },
    economy: { type: Number, require: true },
    threeW_fiveW: { type: String, require: true },
    wicket_matche: { type: Number, require: true },
    level: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bowling", bowlingSchema);
