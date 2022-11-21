import mongoose from "mongoose";

export default mongoose.model(
  "user",
  new mongoose.Schema({
    email: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
  })
);
