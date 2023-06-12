const mongoose = require("mongoose");

const uploadExcelSheetSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    excel_sheet: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("uploadExcelSheet", uploadExcelSheetSchema);
