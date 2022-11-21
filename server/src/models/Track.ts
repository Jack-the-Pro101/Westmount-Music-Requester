import mongoose from "mongoose";

export default mongoose.model(
  "track",
  new mongoose.Schema({
    geniusId: {
      type: String,
      required: true,
    },

    explicit: {
      type: Boolean,
      required: true,
    },
  })
);
