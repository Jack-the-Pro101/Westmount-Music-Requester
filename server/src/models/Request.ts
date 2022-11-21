import mongoose from "mongoose";

export default mongoose.model(
  "request",
  new mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],

    geniusId: {
      type: String,
      required: true,
    },

    sources: [{ type: mongoose.Schema.Types.ObjectId, ref: "track_source" }],

    status: {
      type: String,
      enum: ["PENDING", "REJECTED", "ACCEPTED"],
      default: "PENDING",
    },
  })
);
