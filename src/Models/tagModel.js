const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    tag_id: { type: Number, require: true },
    tag: { type: String, require: true },
    category_id: { type: Number, require: true },
    category_name: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tag", tagSchema);
