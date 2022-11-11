import { Innertube } from "youtubei.js";
import { exec } from "child_process";

class Downloader {
  private yt: Innertube;
  private constructor(yt: Innertube) {
    this.yt = yt;
  }

  static async create(): Promise<Downloader> {
    const yt = await Innertube.create();
    const downloader = new Downloader(yt);
    await downloader.verifyDependencies();
    return downloader;
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
    const songs = await this.yt.music.search(query, { type: "song" });
    return songs.results;
  }
}

export default await Downloader.create();
