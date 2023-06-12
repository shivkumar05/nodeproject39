const mongoose = require("mongoose");

const testExportSchema = new mongoose.Schema(
  {
    category: { type: Number, require: true },
    id: { type: Number, require: true },
    nonintegral: { type: Number, require: true },
    title: { type: String, require: true },
    unit: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("testExport", testExportSchema);
