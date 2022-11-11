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
        })
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("FFMPEG installation check timed out!")), 5000)),
    ]) as Promise<void>;
  }

  async getInfo(query: string) {
    if (!this.ready) throw new Error("Downloader not ready!");
    const songs = await this.yt.music.search(query, { type: "song" });
    return songs.results;
  }
}

export default new Downloader();
