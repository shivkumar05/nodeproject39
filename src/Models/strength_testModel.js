const mongoose = require("mongoose");

const strengthTest = new mongoose.Schema(
  {
    back_squats: { type: Number, require: true },
    front_squats: { type: Number, require: true },
    conventional_deadlifts: { type: Number, require: true },
    barbell_bench_press: { type: Number, require: true },
    barbell_bench_pulls: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("strengthTest", strengthTest);
