const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const ProfileSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: false,
    },
    weight: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    
      selectedExercises: [{
        type: Schema.Types.ObjectId,
        ref: 'Exercise',
      }],
      // other profile fields
    
    
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'profiles', // Specify the collection name
  }
);
const Profile = model("Profile", ProfileSchema);
module.exports = Profile;