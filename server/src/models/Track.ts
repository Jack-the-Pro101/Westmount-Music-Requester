import mongoose from "mongoose";

const tracks = mongoose.model(
  "track",
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },

      artist: {
        type: String,
        required: true,
      },

      cover: {
        type: String,
        required: false,
      },

      youtubeId: {
        type: String,
        required: true,
      },

      explicit: {
        type: Boolean,
      },

      uncertain: {
        type: Boolean,
        required: false,
      },
    },
    {
      versionKey: false,
    }
  )
);

export type Track = typeof tracks extends mongoose.Model<infer T> ? T : unknown;

export default tracks;
