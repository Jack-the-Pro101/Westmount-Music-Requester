import { Injectable } from "@nestjs/common";

import trackSchema from "../models/Track";
import requestSchema from "src/models/Request";
import userSchema from "src/models/User";

import downloader from "src/downloader/downloader";

import * as profaneWords from "./profanity_words.json";
import { RequestData } from "src/types";
import mongoose, { Model } from "mongoose";
import Perspective from "./perspective";

type Request = typeof requestSchema extends Model<infer T> ? T : unknown;

class ScanBuffer {
  private texts: ((value?: unknown) => void)[] = [];

  constructor() {
    setInterval(() => {
      if (this.texts.length === 0) return;

      const resolver = this.texts.shift();

      resolver();
    }, 1000);
  }

  async wait() {
    await new Promise((resolver) => {
      this.texts.push(resolver);
    });
  }
}

@Injectable()
export class RequestService {
  scanBuffer: ScanBuffer;
  constructor() {
    this.scanBuffer = new ScanBuffer();
  }

  async scanLyrics(youtubeId: string, trackId: mongoose.Types.ObjectId): Promise<boolean | undefined> {
    try {
      const existingTrack = await trackSchema.findOne({ youtubeId });

      if (existingTrack) {
        if (existingTrack.explicit == null) return null;
        return !existingTrack.explicit;
      }

      const lyrics = await downloader.getLyrics(youtubeId);

      if (!lyrics) return null;

      const possibleProfaneLines = [];

      for (let i = 0, n = profaneWords.length; i < n; ++i) {
        const word = profaneWords[i].toLowerCase();
        const matches = lyrics.lyrics.matchAll(new RegExp(`^.*${word}.*$`, "gim"));

        for (const match of matches) {
          const line = match[0];

          if (!possibleProfaneLines.includes(line)) possibleProfaneLines.push(line);

          break;
        }
      }

      const client = new Perspective({ apiKey: process.env.PERSPECTIVE_API_KEY });
      let isProfane = false;

      for (let i = 0, n = possibleProfaneLines.length; i < n; ++i) {
        const line = possibleProfaneLines[i];

        const analysisData = {
          comment: {
            text: line,
          },
          requestedAttributes: {
            TOXICITY: {},
            PROFANITY: {},
          },
        };

        await this.scanBuffer.wait();

        const response = await client.analyze(analysisData);

        if (response.attributeScores.TOXICITY.summaryScore.value > 0.7 || response.attributeScores.PROFANITY.summaryScore.value > 0.7) {
          isProfane = true;
          break;
        }
      }

      trackSchema
        .create({
          _id: trackId,
          title: lyrics.title,
          artist: lyrics.artist,
          youtubeId,
          explicit: isProfane,
        })
        .catch((err) => {
          console.error(err);
        });

      return !isProfane;
    } catch (err) {
      console.error(err);
    }
  }

  async getRequests() {
    return await requestSchema
      .find({})
      .populate({
        path: "user",
        select: "-password -username",
      })
      .populate("track");
  }

  async getTrackId(youtubeId: string) {
    return (await trackSchema.findOne({ youtubeId: youtubeId })).id || new mongoose.Types.ObjectId();
  }

  async createRequest(info: RequestData, user: any, trackId: mongoose.Types.ObjectId): Promise<boolean> {
    try {
      const userDoc = await userSchema.findOne(user.type === "GOOGLE" ? { email: user.email } : { username: user.username });

      if (userDoc == null) return false;

      await requestSchema.create({
        spotifyId: info.spotifyId,
        start: info.playRange,
        track: trackId,
        user: userDoc.id,
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async updateRequest(trackId: mongoose.Types.ObjectId, data: mongoose.UpdateQuery<Request>) {
    try {
      await requestSchema.findOneAndUpdate({ track: trackId }, data);
    } catch (err) {
      console.error(err);
    }
  }
}
