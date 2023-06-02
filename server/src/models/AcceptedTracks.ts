import mongoose from "mongoose";

export default mongoose.model(
  "accepted_tracks",
  new mongoose.Schema(
    {
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
