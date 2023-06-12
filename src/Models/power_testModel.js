const mongoose = require("mongoose");

const powerTest = new mongoose.Schema(
  {
    vertical_jump: { type: Number, require: true },
    squat_jump: { type: Number, require: true },
    standing_broad_jump: { type: Number, require: true },
    ball_chest_throw: { type: Number, require: true },
    hang_cleans: { type: Number, require: true },
    cleans: { type: Number, require: true },
    power_cleans: { type: Number, require: true },
    snatch_floor: { type: Number, require: true },
    hang_snatch: { type: Number, require: true },
    split_jerk: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("powerTest", powerTest);
