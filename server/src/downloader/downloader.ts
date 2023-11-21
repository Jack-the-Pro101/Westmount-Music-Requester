import { Innertube, UniversalCache } from "youtubei.js";
import { exec } from "child_process";
import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import { FfmpegPostProcessOptions } from "../types";
import mongoose from "mongoose";
import { YTNodes } from "youtubei.js";

class Downloader {
  private yt?: Innertube;
  private ready = false;
  constructor() {}

  async initialize() {
    const yt = await Innertube.create({
      cache: new UniversalCache(true, process.env.YT_CACHE_DIR),
    });
    this.yt = yt;
    await this.verifyDependencies();
    this.ready = true;
    return this;
  }

  verifyDependencies(): Promise<void> {
    if (!process.env.DOWNLOADS) throw new Error("Downloads directory not defined in env vars. Application cannot continue.");

    return Promise.race([
      new Promise<void>((resolve, reject) => {
        // Verify installation of FFMPEG

        exec("ffmpeg -version", (e) => {
          if (e == null) {
            resolve();
          } else {
            reject(new Error(`FFMPEG installation check failed! Process cannot continue without this core dependency.\n${e}`));
          }
        });
      }),
      new Promise<void>((_, reject) => setTimeout(() => reject(new Error("FFMPEG installation check timed out!")), 10000)),
    ]);
  }

  async checkSession() {
    if (!this.yt || !this.ready) throw new Error("Downloader not ready!");
    if (this.yt.session.oauth.has_access_token_expired) {
      await this.yt.session.oauth.refreshIfRequired();
    }
  }

  async checkReady() {
    if (!this.yt || !this.ready) throw new Error("Downloader not ready!");
    await this.checkSession();
  }

  async searchYt(query: string) {
    await this.checkReady();

    const songs = await this.yt!.music.search(query, { type: "song" });

    return songs.contents?.firstOfType(YTNodes.MusicShelf)?.contents;
  }

  async getYtMusicInfo(id: string) {
    await this.checkReady();

    return await this.yt!.music.getInfo(id).catch(() => null);
  }

  async getLyrics(id: string) {
    await this.checkReady();

    try {
      const lyrics = await this.yt!.music.getLyrics(id);
      if (!lyrics) return "";

      return lyrics.description.text;
    } catch (err) {
      return "";
    }
  }

  async getSource(id: string, excludeFormats: string[]) {
    await this.checkReady();

    try {
      const trackInfo = await this.yt!.music.getInfo(id);

      if (!trackInfo.streaming_data) throw new Error("No streaming data found!");

      const adaptiveAudioFormats = trackInfo.streaming_data.adaptive_formats.filter((format) => format.has_audio && !format.has_video);
      const audioFormats = trackInfo.streaming_data.formats.filter((format) => format.has_audio && !format.has_video);

      const bestAudioFormat = [...adaptiveAudioFormats, ...audioFormats]
        .filter((format) => excludeFormats.every((formatName) => !format.mime_type.includes(formatName)))
        .sort((a, b) => b.average_bitrate! - a.average_bitrate!)[0];

      return {
        url: bestAudioFormat.decipher(this.yt!.session.player),
        duration: bestAudioFormat.approx_duration_ms,
        mime_type: bestAudioFormat.mime_type.split(";")[0],
        format: "audio",
      };
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  async download(id: string, filename: string, ffmpegArgs: FfmpegPostProcessOptions) {
    await this.checkReady();

    const format = await this.yt!.getStreamingData(id, {
      quality: "best",
      type: "audio",
    });

    const video = await this.yt!.download(id, {
      quality: "best",
      type: "audio",
    });

    if (!fs.existsSync(process.env.DOWNLOADS!)) {
      await fsPromises.mkdir(process.env.DOWNLOADS!, {
        recursive: true,
      });
    }

    const tempFilepath = path.join(
      process.env.DOWNLOADS!,
      `${path.parse(filename).name} ${new mongoose.Types.ObjectId()}.${format.mime_type.split(";")[0].split("/")[1]}`
    );

    const writer = await fsPromises.open(tempFilepath, "w");

    const reader = video.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (value !== undefined) {
        writer.write(value);
      }
      if (done) break;
    }

    await writer.close();

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i "${tempFilepath}" -c:a ${ffmpegArgs.codec} -ss ${ffmpegArgs.start} -t ${ffmpegArgs.end} "${filename}"`,
        {
          cwd: process.env.DOWNLOADS!,
        },
        (e) => {
          if (e == null) {
            resolve(true);
          } else {
            reject(e);
          }
        }
      );
    });

    await fsPromises.rm(tempFilepath);

    return filename;
  }
}

export default new Downloader();
