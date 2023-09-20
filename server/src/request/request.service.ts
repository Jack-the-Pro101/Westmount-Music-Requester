import { Injectable } from "@nestjs/common";

import trackSchema from "../models/Track";
import requestSchema from "../models/Request";
import downloadedTracksSchema from "../models/DownloadedTracks";
import userSchema from "../models/User";

import downloader from "../downloader/downloader";

import * as profaneWords from "./profanity_words.json";
import { RequestData, Request as RequestType, StoredUser, WithId } from "../types";
import mongoose, { ObjectId } from "mongoose";
import Perspective from "./perspective";
import { MusicService } from "../music/music.service";

import * as config from "../shared/config.json";
import { sanitizeFilename } from "../utils";

import { Request } from "../models/Request";
import AcceptedTracks from "../models/AcceptedTracks";
import * as JSZip from "jszip";
import { mkdir, readFile, readdir, rm, rmdir } from "fs/promises";
import { join } from "path";
import { createWriteStream } from "fs";
import { tmpdir } from "os";

const profaneRegexs: RegExp[] = [];

for (let i = 0, n = profaneWords.length; i < n; ++i) {
  profaneRegexs.push(new RegExp(`^.*${profaneWords[i]}.*$`, "gim"));
}

class ScanBuffer {
  private texts: ((value?: unknown) => void)[] = [];
  private scanningYtTracks: {
    [key: string]: true;
  } = {};

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

  async waitScanComplete(youtubeId: string) {
    if (!this.scanningYtTracks[youtubeId]) {
      this.scanningYtTracks[youtubeId] = true;
      return;
    }

    return await new Promise<void>((resolve) => {
      const checkScanDone = setInterval(() => {
        if (!this.scanningYtTracks[youtubeId]) {
          clearInterval(checkScanDone);
          resolve();
        }
      }, 2000);
    });
  }

  scanComplete(youtubeId: string) {
    delete this.scanningYtTracks[youtubeId];
  }
}

@Injectable()
export class RequestService {
  scanBuffer: ScanBuffer;
  constructor(private readonly musicService: MusicService) {
    this.scanBuffer = new ScanBuffer();
  }

  async evaluateRequest(youtubeId: string, trackId: mongoose.Types.ObjectId) {
    const existingTrack = await trackSchema.findOne({ youtubeId });

    if (existingTrack != null) {
      const pastAccepted = await AcceptedTracks.findOne({ track: existingTrack._id });
      if (pastAccepted != null) return await this.updateRequest({ track: trackId, status: "AWAITING" }, { status: "ACCEPTED" });
    }

    const scanResult = await this.scanLyrics(youtubeId, existingTrack);

    if (scanResult === false) {
      await this.updateRequest({ track: trackId, status: "AWAITING" }, { status: "AUTO_REJECTED" });
    } else {
      await this.updateRequest({ track: trackId, status: "AWAITING" }, { status: scanResult == null ? "PENDING_MANUAL" : "PENDING" });
    }
  }

  async scanLyrics(youtubeId: string, track: any): Promise<boolean | undefined> {
    try {
      await this.scanBuffer.waitScanComplete(youtubeId);

      if (track) {
        if (track.uncertain) return;
        if (track.explicit != null) return !track.explicit === true;
      }

      const lyrics = await downloader.getLyrics(youtubeId);

      if (!lyrics) {
        await trackSchema
          .findOneAndUpdate(
            { _id: track._id },
            {
              explicit: null,
              uncertain: true,
            }
          )
          .catch((err) => {
            console.error(err);
          });
        return;
      }

      const possibleProfaneLines: string[] = [];

      for (let i = 0, n = profaneRegexs.length; i < n; ++i) {
        const profaneRegex = profaneRegexs[i];
        const matches = lyrics.matchAll(profaneRegex);

        for (const match of matches) {
          const line = match[0];

          if (!possibleProfaneLines.includes(line)) possibleProfaneLines.push(line);

          break;
        }
      }

      const client = new Perspective({
        apiKey: process.env.PERSPECTIVE_API_KEY,
      });
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

      await trackSchema
        .findOneAndUpdate(
          { _id: track._id },
          {
            explicit: isProfane,
          }
        )
        .catch((err) => {
          console.error(err);
        });

      this.scanBuffer.scanComplete(youtubeId);

      return !isProfane;
    } catch (err) {
      console.error(err);
    }
  }

  async validateRequest(data: RequestData, user: WithId<StoredUser>) {
    const { playRange, spotifyId, youtubeId } = data;

    if ((await this.getPersonalRequests(user._id)).length >= config.maxSongsPerCycle) return false;

    if (playRange < 0) return false;

    const tests = await Promise.all([
      // Test YouTube source
      new Promise((resolve, reject) => {
        downloader
          .getSource(youtubeId, [])
          .then((song) => {
            if (!song) return reject();
            if (song.duration - config.songMaxPlayDurationSeconds < playRange) reject();
            if (playRange + config.songMaxPlayDurationSeconds > song.duration) reject();
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
    const requests = (await requestSchema
      .find({})
      .populate({
        path: "user",
        select: "-password -username",
      })
      .populate("track")
      .lean()) as RequestType[];

    const popularityMap = new Map();

    for (let i = 0, n = requests.length; i < n; ++i) {
      const request = requests[i];

      if (!popularityMap.has(request.track._id.toString())) {
        popularityMap.set(request.track._id.toString(), 1);
      } else {
        popularityMap.set(request.track._id.toString(), popularityMap.get(request.track._id.toString()) + 1);
      }
    }

    let sift = 0;
    popularityMap.forEach((popularity) => {
      requests[sift].popularity = popularity;
      ++sift;
    });

    return requests;
  }

  async getPersonalRequests(userId: string) {
    return await requestSchema.find({ user: userId }).populate("track");
  }

  async getTrackId(youtubeId: string) {
    const track = await trackSchema.findOne({ youtubeId: youtubeId });
    if (track != null) return track.id;

    const info = await downloader.getYtMusicInfo(youtubeId);
    if (info == null) return console.error("Failed to create track, info was null");

    const newTrack = await trackSchema.create({
      title: info.basic_info.title,
      cover: info.basic_info.thumbnail?.[0].url,
      artist: info.basic_info.author,
      explicit: null,
      youtubeId,
    });

    return newTrack.id;
  }

  async createRequest(info: RequestData, user: StoredUser, trackId: mongoose.Types.ObjectId): Promise<boolean> {
    try {
      const userDoc = await userSchema.findOne(user.type === "GOOGLE" ? { email: user.email } : { username: user.username });

      if (userDoc == null) return false;

      const existingAcceptedRequest = await requestSchema.findOne({
        track: trackId,
        status: "ACCEPTED",
      });

      if (existingAcceptedRequest != null) {
        await requestSchema.create({
          spotifyId: info.spotifyId,
          start: info.playRange,
          status: "ACCEPTED",
          track: trackId,
          user: userDoc.id,
        });

        return false;
      }

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

  async cancelRequest(requestId: string) {
    const request = await requestSchema.findOneAndDelete({ _id: requestId });

    if (request == null) return false;
    return true;
  }

  async checkExistingRequest(spotifyId: string, trackId: string, userId: string) {
    const existingRequest = await requestSchema.findOne({
      $or: [{ spotifyId: spotifyId }, { track: trackId }],
      user: userId,
    });
    if (existingRequest != null) return true;
    return false;
  }

  async updateRequest(query: mongoose.FilterQuery<Request>, data: mongoose.UpdateQuery<Request>) {
    try {
      await requestSchema.findOneAndUpdate(query, data);
    } catch (err) {
      console.error(err);
    }
  }

  async updateManyRequests(query: mongoose.FilterQuery<Request>, data: mongoose.UpdateQuery<Request>) {
    try {
      await requestSchema.updateMany(query, data);
    } catch (err) {
      console.error(err);
    }
  }

  async createAcceptedTrack(trackId: string) {
    return await AcceptedTracks.create({
      track: trackId,
    });
  }

  async finalizeRequest(trackId: string) {
    const requestRequest = await requestSchema.updateMany({ track: trackId }, { status: "ACCEPTED" }).populate("track");
    if (!requestRequest) return;

    this.createAcceptedTrack(trackId);

    const request = await requestSchema.findOne({ track: trackId }); // This could use the average start time of all requests
    const requestTrack = await trackSchema.findOne({ _id: trackId });

    const filename = sanitizeFilename(`${requestTrack!.youtubeId} ${requestTrack!.title} - ${requestTrack!.artist}`, "_") + `.${config.downloadExt}`;

    if ((await downloadedTracksSchema.findOne({ filename })) != null) {
      console.log(filename, "already downloaded. Stopping re-download.");
      return;
    }

    const downloadResult = await downloader.download(requestTrack!.youtubeId, filename, {
      format: config.downloadExt,
      codec: config.downloadFfmpegCodec,
      start: request!.start,
      end: config.songMaxPlayDurationSeconds,
    });

    if (downloadResult) {
      await downloadedTracksSchema.create({
        track: trackId,
        filename: downloadResult,
      });
    }
  }

  async recycleRequests() {
    return await requestSchema.collection.drop();
  }

  async purgeDownloads() {
    try {
      await rm(process.env.DOWNLOADS!, {
        recursive: true,
      });
      await mkdir(process.env.DOWNLOADS!, {
        recursive: true,
      });

      return true;
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  async createTracksArchive() {
    const zipName = "music.zip";
    const zipFile = join(tmpdir(), zipName);

    const musicDir = await readdir(process.env.DOWNLOADS!);

    const musicZip = new JSZip();

    for (const filename of musicDir) {
      musicZip.file(filename, await readFile(join(process.env.DOWNLOADS!, filename)));
    }

    try {
      await new Promise((resolve, reject) => {
        musicZip.generateNodeStream().pipe(createWriteStream(zipFile)).on("error", reject).on("finish", resolve);
      });
    } catch (error) {
      console.error(error);
      return null;
    }

    return zipFile;
  }
}
