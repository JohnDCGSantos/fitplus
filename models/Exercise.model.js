const { Schema, model } = require("mongoose");
const exerciseSchema = new Schema(
  {
    name: { type: String, required: true },
    force: { type: String },
    level: { type: String },
    mechanic: { type: String },
    equipment: { type: String },
    primaryMuscles: [{ type: String }],
    secondaryMuscles: [{ type: String }],
    instructions: [{ type: String }],
    category: { type: String },
    images: [{ type: String }],
    id: { type: String, unique: true, required: true },
  },
  {
    // This second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true
  }
);
const Exercise = model('Exercise', exerciseSchema);
module.exports = Exercise;