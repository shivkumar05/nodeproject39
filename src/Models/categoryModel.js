const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    category_id: { type: Number, require: true },
    category_name: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("category", categorySchema);
