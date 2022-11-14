import { Innertube } from "youtubei.js";
import { exec } from "child_process";

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
      new Promise((_, reject) => setTimeout(() => reject(new Error("FFMPEG installation check timed out!")), 5000)),
    ]) as Promise<void>;
  }

  async getInfo(query: string) {
    if (!this.ready) throw new Error("Downloader not ready!");
    const songs = await this.yt.music.search(query, { type: "song" });

    songs.results.splice(5);

    return songs.results;
  }

  async getSource(id: string) {
    if (!this.ready) throw new Error("Downloader not ready!");

    const trackInfo = await this.yt.music.getInfo(id);

    const adaptiveAudioFormats = trackInfo.streaming_data.adaptive_formats.filter((format) => format.has_audio && !format.has_video);
    const audioFormats = trackInfo.streaming_data.formats.filter((format) => format.has_audio && !format.has_video);

    const bestAudioFormat = [...adaptiveAudioFormats, ...audioFormats].sort((a, b) => b.average_bitrate - a.average_bitrate)[0];

    return {
      url: bestAudioFormat.decipher(this.yt.session.player),
      mime_type: bestAudioFormat.mime_type.split(";")[0],
      format: "audio",
    };
  }
}

export default new Downloader();
