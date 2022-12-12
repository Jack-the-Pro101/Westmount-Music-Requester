import { Innertube } from "youtubei.js";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Stream } from "stream";
import { FfmpegPostProcessOptions } from "src/types";

class Downloader {
  private yt: Innertube;
  private ready: boolean;
  constructor() {}

  async initialize() {
    const yt = await Innertube.create();
    this.yt = yt;
    await this.verifyDependencies();
    this.ready = true;
    return this;
  }

  verifyDependencies(): Promise<void> {
    return Promise.race([
      new Promise<void>((resolve, reject) => {
        // Verify installation of FFMPEG

        const ffmpegCheck = exec("ffmpeg -version");
        ffmpegCheck.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`FFMPEG installation check failed with exit code ${code}! Process cannot continue without this core dependency.`));
          }
        });
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("FFMPEG installation check timed out!")), 10000)),
    ]) as Promise<void>;
  }

  async checkSession() {
    if (this.yt.session.oauth.has_access_token_expired) {
      await this.yt.session.oauth.refreshIfRequired();
    }
  }

  async searchYt(query: string) {
    if (!this.ready) throw new Error("Downloader not ready!");
    await this.checkSession();

    const songs = await this.yt.music.search(query, { type: "song" });

    songs.results.splice(5);

    return songs.results;
  }

  async getBasicInfo(id: string) {
    if (!this.ready) throw new Error("Downloader not ready!");
    await this.checkSession();

    return await this.yt.getBasicInfo(id);
  }

  async getLyrics(id: string) {
    if (!this.ready) throw new Error("Downloader not ready!");
    await this.checkSession();

    const getLyricsAndInfo = async () => {
      const info = await this.yt.music.getInfo(id);

      try {
        const lyrics = await this.yt.music.getLyrics(id);

        return {
          lyrics: lyrics.description.text,
          title: info.basic_info.title,
          cover: info.basic_info.thumbnail[0].url,
          artist: info.basic_info.author,
        };
      } catch {
        return {
          lyrics: "",
          title: info.basic_info.title,
          cover: info.basic_info.thumbnail[0].url,
          artist: info.basic_info.author,
        };
      }
    };

    try {
      return await getLyricsAndInfo();
    } catch (err) {
      console.error(err);
    }
  }

  async getSource(id: string) {
    if (!this.ready) throw new Error("Downloader not ready!");
    await this.checkSession();

    try {
      const trackInfo = await this.yt.music.getInfo(id);

      const adaptiveAudioFormats = trackInfo.streaming_data.adaptive_formats.filter((format) => format.has_audio && !format.has_video);
      const audioFormats = trackInfo.streaming_data.formats.filter((format) => format.has_audio && !format.has_video);

      const bestAudioFormat = [...adaptiveAudioFormats, ...audioFormats].sort((a, b) => b.average_bitrate - a.average_bitrate)[0];

      return {
        url: bestAudioFormat.decipher(this.yt.session.player),
        duration: bestAudioFormat.approx_duration_ms,
        mime_type: bestAudioFormat.mime_type.split(";")[0],
        format: "audio",
      };
    } catch {
      return false;
    }
  }

  async download(id: string, filename: string, ffmpegArgs: FfmpegPostProcessOptions) {
    if (!this.ready) throw new Error("Downloader not ready!");
    await this.checkSession();

    const format = await this.yt.getStreamingData(id, {
      quality: "best",
      type: "audio",
    });

    const video = await this.yt.download(id, {
      quality: "best",
      type: "audio",
    });

    const filepath = path.join(process.env.DOWNLOADS, filename + "." + format.mime_type.split(";")[0].split("/")[1]);

    await new Promise(async (resolve, reject) => {
      const writer = fs.createWriteStream(filepath, {
        encoding: "binary",
      });

      const reader = video.getReader();

      await new Promise((resolve, reject) => {
        reader.read().then(function parseChunks({ done, value }) {
          if (done) {
            return resolve(true);
          }
          writer.write(value);

          return reader.read().then(parseChunks);
        });
      });

      writer.end();

      writer.once("finish", () => {
        resolve(true);
      });
    });

    const processedFilename = filename + "." + ffmpegArgs.format;

    await new Promise((resolve, reject) => {
      const worker = exec(`ffmpeg -i "${filepath}" -c:a ${ffmpegArgs.codec} -ss ${ffmpegArgs.start} -t ${ffmpegArgs.end} "${processedFilename}"`, {
        cwd: process.env.DOWNLOADS,
      });

      worker.on("close", (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject();
        }
      });
    });

    fs.rmSync(filepath);

    return processedFilename;
  }
}

export default new Downloader();
