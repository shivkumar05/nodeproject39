const mongoose = require("mongoose");

const TestModel = new mongoose.Schema(
    {   
        userId: { type: String },
        testId: { type: Number },
        catId: { type: Number },
        date: { type: String, require: true},
        title:{type:String,require:true},
        score:{type: Number , require :true},
        unit:{ type: String, require: true},
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("TestModel", TestModel);