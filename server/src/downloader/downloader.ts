import { spawn, exec } from "child_process";

import { downloaderPath } from "./ytDlp";

class Downloader {
  constructor() {
    // Verify installation of FFMPEG and yt-dlp

    const ffmpegCheck = exec("ffmpeg -version");
    ffmpegCheck.on("close", (code) => {
      if (code !== 0) {
        throw new Error(`FFMPEG installation check failed with exit code ${code}! Process cannot continue without this core dependency.`);
      }
    });

    const ytDlpCheck = spawn(downloaderPath, ["--version"]);
    ytDlpCheck.on("close", (code) => {
      if (code !== 0) {
        throw new Error(`yt-dlp installation check failed with exit code ${code}! Process cannot continue without this core dependency.`);
      }
    });
  }

  async getInfo(query: string) {
    return await new Promise((resolve, reject) => {
      const args = ["--default-search", "https://music.youtube.com/search?q=", "--playlist-items", "1:5", "--dump-json", query];

      const infoProcess = spawn(downloaderPath, args);
      infoProcess.stdout.setEncoding("utf-8");
      infoProcess.stderr.setEncoding("utf-8");

      const dataAcc = [];

      infoProcess.stdout.on("data", (data) => {
        dataAcc.push(data.toString());
      });

      infoProcess.on("close", (code) => {
        if (code === 0) {
          resolve(`[${dataAcc.join()}]`);
        }
      });
    });
  }
}

export default new Downloader();
