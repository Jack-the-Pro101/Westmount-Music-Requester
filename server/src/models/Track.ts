import mongoose from "mongoose";

export default mongoose.model(
  "track",
  new mongoose.Schema({
    youtubeId: {
      type: String,
      required: true,
    },

    explicit: {
      type: Boolean,
      required: true,
    },
  })
);
