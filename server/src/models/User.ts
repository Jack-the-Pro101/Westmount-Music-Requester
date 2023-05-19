import mongoose from "mongoose";

const users = mongoose.model(
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
        required: false,
        default: "User",
      },
    },
    {
      versionKey: false,
    }
  )
);

export type User = typeof users extends mongoose.Model<infer T> ? T : unknown;

export default users;
