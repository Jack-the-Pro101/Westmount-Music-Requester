import mongoose from "mongoose";

const requests = mongoose.model(
  "request",
  new mongoose.Schema(
    {
      spotifyId: {
        type: String,
        required: true,
      },

      track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "track",
        required: true,
      },

      start: {
        type: Number,
        min: 0,
        default: 0,
      },

      user: {
        type: String,
        ref: "user",
        required: true,
      },

      status: {
        type: String,
        enum: [
          "AWAITING",
          "PENDING",
          "PENDING_MANUAL",
          "AUTO_REJECTED",
          "REJECTED",
          "ACCEPTED",
        ],
        default: "AWAITING",
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  )
);

export type Request = typeof requests extends mongoose.Model<infer T>
  ? T
  : unknown;

export default requests;
