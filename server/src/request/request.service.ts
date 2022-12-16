import { Injectable } from "@nestjs/common";

import trackSchema from "../models/Track";
import requestSchema from "src/models/Request";
import downloadedTracksSchema from "src/models/DownloadedTracks";
import userSchema from "src/models/User";

import downloader from "src/downloader/downloader";

import * as profaneWords from "./profanity_words.json";
import { RequestData, StoredUser } from "src/types";
import mongoose from "mongoose";
import Perspective from "./perspective";
import { MusicService } from "src/music/music.service";

import * as config from "../shared/config.json";
import { sanitizeFilename } from "src/utils";

import { Request } from "src/models/Request";
import { Track } from "../models/Track";

class ScanBuffer {
  private texts: ((value?: unknown) => void)[] = [];

  constructor() {
    setInterval(() => {
      const resolver = this.texts.shift();

      if (resolver) resolver();
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
  constructor(private readonly musicService: MusicService) {
    this.scanBuffer = new ScanBuffer();
  }

  async scanLyrics(youtubeId: string, trackId: mongoose.Types.ObjectId): Promise<boolean | undefined> {
    try {
      const existingTrack = await trackSchema.findOne({ youtubeId });

      if (existingTrack) {
        if (existingTrack.uncertain) return;
        return !existingTrack.explicit;
      }

      const lyrics = await downloader.getLyrics(youtubeId);
      if (!lyrics) return;

      if (!lyrics.lyrics) {
        trackSchema
          .create({
            _id: trackId,
            title: lyrics.title,
            artist: lyrics.artist,
            youtubeId,
            cover: lyrics.cover,
            explicit: false,
            uncertain: true,
          })
          .catch((err) => {
            console.error(err);
          });

        return;
      }

      const possibleProfaneLines: string[] = [];

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

        if (response.attributeScores.TOXICITY!.summaryScore.value > 0.7 || response.attributeScores.PROFANITY!.summaryScore.value > 0.7) {
          isProfane = true;
          break;
        }
      }

      trackSchema
        .create({
          _id: trackId,
          title: lyrics.title,
          artist: lyrics.artist,
          cover: lyrics.cover,
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

  async validateRequest(data: RequestData) {
    const { playRange, spotifyId, youtubeId } = data;

    if (playRange < 0) return false;

    const tests = await Promise.all([
      // Test YouTube source
      new Promise((resolve, reject) => {
        downloader
          .getSource(youtubeId)
          .then((song) => {
            if (!song) return reject();
            if (song.duration - config.songMaxPlayDurationSeconds < playRange) reject();
            if (song.duration < config.songMaxPlayDurationSeconds) reject();
            resolve(true);
          })
          .catch(() => reject());
      }),

      // Test Spotify track
      new Promise((resolve, reject) => {
        this.musicService
          .getSpotifyTrack(spotifyId)
          .then((spotifyTrack) => {
            if (spotifyTrack.explicit) reject();
            resolve(true);
          })
          .catch(() => reject());
      }),
    ]).catch(() => false);

    return tests;
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

  async getPersonalRequests(userId: string) {
    return await requestSchema.find({ user: userId }).populate("track");
  }

  async getTrackId(youtubeId: string) {
    return (await trackSchema.findOne({ youtubeId: youtubeId }))?.id || new mongoose.Types.ObjectId();
  }

  async createRequest(info: RequestData, user: StoredUser, trackId: mongoose.Types.ObjectId): Promise<boolean> {
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

  async updateRequest(query: mongoose.FilterQuery<Request>, data: mongoose.UpdateQuery<Request>) {
    try {
      await requestSchema.findOneAndUpdate(query, data);
    } catch (err) {
      console.error(err);
    }
  }

  async finalizeRequest(id: string) {
    const requestRequest = await requestSchema.findOneAndUpdate({ _id: id }, { status: "ACCEPTED" }).populate("track");
    if (!requestRequest) return;

    const request = requestRequest as unknown as Request & { track: Track };
    
    const filename = sanitizeFilename(`${request.track.title} - ${request.track.artist}`, "_");

    const downloadResult = await downloader.download(request.track.youtubeId, filename, {
      format: "mp3",
      codec: "libmp3lame",
      start: request.start,
      end: config.songMaxPlayDurationSeconds,
    });

    if (downloadResult) {
      await downloadedTracksSchema.create({
        track: request.track,
        filename: downloadResult,
      });
    }
  }
}
