const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    Exercise_Name: String,
    Type: String,
    Exercise_Type: String,
    Session_Id: [Number],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", exerciseSchema);
