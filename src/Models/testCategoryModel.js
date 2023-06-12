const mongoose = require("mongoose");

const testCategorySchema = new mongoose.Schema(
  {
    id: { type: Number, require: true },
    title: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("testCategory", testCategorySchema);
