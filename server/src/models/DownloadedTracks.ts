import mongoose from "mongoose";

export default mongoose.model(
  "downloaded_track",
  new mongoose.Schema(
    {
      filename: {
        type: String,
        required: true,
      },

      track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "track",
        required: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  )
);
