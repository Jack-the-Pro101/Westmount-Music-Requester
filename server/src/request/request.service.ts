import { Injectable } from "@nestjs/common";

import trackSchema from "../models/Track";
import requestSchema from "src/models/Request";
import userSchema from "src/models/User";

import { google } from "googleapis";
import downloader from "src/downloader/downloader";

import * as profaneWords from "./profanity_words.json";
import { GoogleUser, GoogleUserInfo, RequestData } from "src/types";
import mongoose from "mongoose";

class ScanBuffer {
  private static texts: any[] = [];
  private static ticker;

  constructor() {}

  static init() {
    ScanBuffer.ticker = setInterval(() => {
      if (ScanBuffer.texts.length === 0) return;

      const resolver = ScanBuffer.texts.shift();

      resolver();
    }, 1000);
  }

  static async wait() {
    await new Promise((resolver) => {
      this.texts.push(resolver);
    });
  }
}

@Injectable()
export class RequestService {
  constructor() {
    ScanBuffer.init();
  }

  async scanLyrics(youtubeId: string, trackId: mongoose.Types.ObjectId): Promise<boolean | null> {
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

      const DISCOVERY_URL = "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";
      const client = await google.discoverAPI(DISCOVERY_URL);

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

        await ScanBuffer.wait();

        const isProfane = await new Promise((resolve, reject) => {
          // @ts-expect-error
          client.comments.analyze({ key: process.env.PERSPECTIVE_API_KEY, resource: analysisData }, (err, response) => {
            if (err) {
              console.error(err);
              return reject(err);
            }

            if (response.data.attributeScores.TOXICITY.summaryScore.value > 0.7 || response.data.attributeScores.PROFANITY.summaryScore.value > 0.7) {
              resolve(true);

              trackSchema
                .create({
                  _id: trackId,
                  title: lyrics.title,
                  artist: lyrics.artist,
                  youtubeId,
                  explicit: true,
                })
                .catch((err) => {
                  console.error(err);
                });

              return;
            }

            resolve(false);
          });
        });

        if (isProfane) {
          return false;
        }
      }

      trackSchema
        .create({
          _id: trackId,
          title: lyrics.title,
          artist: lyrics.artist,
          youtubeId,
          explicit: false,
        })
        .catch((err) => {
          console.error(err);
        });

      return true;
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

  async updateRequest(trackId: mongoose.Types.ObjectId, data) {
    try {
      await requestSchema.findOneAndUpdate({ track: trackId }, data);
    } catch (err) {
      console.error(err);
    }
  }
}
