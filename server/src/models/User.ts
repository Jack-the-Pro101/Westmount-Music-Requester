import mongoose from "mongoose";

export default mongoose.model(
  "user",
  new mongoose.Schema(
    {
      email: {
        type: String,
        required: false,
      },

      username: {
        type: String,
        required: false,
      },

      password: {
        type: String,
        required: false,
      },

      avatar: {
        type: String,
        required: false,
      },

      type: {
        type: String,
        enum: ["GOOGLE", "INTERNAL"],
        default: "GOOGLE",
      },

      permissions: {
        type: Number,
        default: 2,
      },

      name: {
        type: String,
        required: true,
      },
    },
    {
      versionKey: false,
    }
  )
);
