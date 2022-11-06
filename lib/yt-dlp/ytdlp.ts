import os from "os";
import path from "path";

let filename: string | null = "";
switch (os.platform()) {
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
    filename = null;
}

if (filename == null) {
  throw new Error("Unsupported OS for yt-dlp! Program cannot continue.");
}

const ytdlpPath: string = path.join(process.cwd(), "./lib/yt-dlp/" + filename);

export default ytdlpPath;
