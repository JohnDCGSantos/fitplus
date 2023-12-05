const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const planSchema = new Schema(
  {
    name:
    {type: String,},
    user:
     { type: mongoose.Schema.Types.ObjectId,
         ref: 'User', 
         required: true },
        exercises: 
  [{ type: String, required: true }],});

  const Plan = model('Plan', planSchema);
module.exports = Plan;