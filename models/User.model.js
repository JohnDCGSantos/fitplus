const { Schema, model } = require("mongoose");
// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    profile: {
      weight: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: true
      },
      age: {
        type: Number,
        required: true
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true
      }
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true
  }
);
const User = model("User", userSchema);
module.exports = User;