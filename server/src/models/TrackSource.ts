import mongoose from "mongoose";

export default mongoose.model(
  "track_source",
  new mongoose.Schema({
    url: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    start: {
      type: Number,
      min: 0,
      default: 0,
    },
  })
);
