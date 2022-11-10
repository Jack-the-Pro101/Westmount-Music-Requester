import * as path from "path";

const temp = "H:\\Programming Projects\\Web Development Projects\\Westmount Music Requester\\server\\src\\downloader";

// if (!process.env.YTDLP_PATH) throw new Error("yt-dlp path not specified in environment variables! This is a required dependency. Exiting...");

let filename: string;

switch (process.platform) {
  case "linux":
    filename = "yt-dlp_linux";
    break;
  case "win32":
    filename = "yt-dlp.exe";
    break;
  case "darwin":
    filename = "yt-dlp_macos";
    break;
  default:
    throw new Error("yt-dlp on unknown OS! Unable to select version. Cannot proceed with start.");
}

export const downloaderPath = path.join(process.env.YTDLP_PATH || temp, filename);
