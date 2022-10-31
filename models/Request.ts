import mongoose from "mongoose";

export default mongoose.model(
  "request",
  new mongoose.Schema(
    {
      songId: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  )
);
