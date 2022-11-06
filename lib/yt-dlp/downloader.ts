import { spawn, exec } from "child_process";

import ytdlpPath from "./ytdlp";

import kill from "tree-kill";

function interact(args: any) {
  const child = spawn(ytdlpPath, args).on("error", function (err) {
    return { child: null, err };
  });

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");

  const cancel = () => kill(child.pid!, (err) => err);

  return { child, cancel };
}

class Downloader {
  constructor() {
    // Update and verify installation of binaries

    console.log("Constructed");

    const checkYtdlp = interact(["-U"]);

    checkYtdlp?.child?.once("close", (code) => {
      if (code !== 0) {
        console.error("FATAL ERROR: yt-dlp threw exit code " + code + " on update check.");
        process.exit(1);
      }
    });

    const ffmpegCheck = exec("ffmpeg -version");
  }

  getInfo(search: string) {
    const childProcess = interact(["--default-search", "https://music.youtube.com/search?q=", search]);
  }
}

const downloader = new Downloader();

export default downloader;
