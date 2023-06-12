const mongoose = require("mongoose");

const SessionModel = new mongoose.Schema(
    {
        id: { type: Number, require: true },
        SessionType: { type: String },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("SessionModel", SessionModel);