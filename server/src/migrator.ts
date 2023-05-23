import mongoose from "mongoose";

import usersSchema from "./models/User";
import { decodeTime, ulid } from "ulid";

export async function migrate() {    
  const unmigratedRequests = mongoose.model(
    "unmigratedRequests",
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
          type: mongoose.SchemaTypes.Mixed,
          ref: "user",
          required: true,
        },

        status: {
          type: String,
          enum: ["AWAITING", "PENDING", "PENDING_MANUAL", "AUTO_REJECTED", "REJECTED", "ACCEPTED"],
          default: "AWAITING",
        },
      },
      {
        timestamps: true,
        versionKey: false,
      }
    ), "requests"
  );
  
  try {
    const users = await usersSchema.find({});
    for (let i = 0; i < users.length; i++) {
      try {
        decodeTime(users[i]._id);
      } catch {
        let user = users[i].toObject();
        await usersSchema.findOneAndDelete(user.email ? { email: user.email } : { username: user.username });
        const oldId = new mongoose.Types.ObjectId(user._id);
        user._id = ulid(oldId.getTimestamp().getTime());
        await usersSchema.create(user);
        await unmigratedRequests.updateMany({ user: oldId }, { user: user._id });
      }
    }
  } catch (e) {
    console.error("failed to migrate object ID: ", e);
  }

}