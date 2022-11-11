import { Injectable } from "@nestjs/common";
import { Hits, YouTubeSong } from "src/types";

import downloader from "../downloader/downloader";

@Injectable()
export class MusicService {
  async search(query: string) {
    try {
      const request = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(query)}&access_token=${process.env.GENIUS_ACCESS_TOKEN}`);
      const response = await request.json();

      const songs = (response.response?.hits || []) as Hits;

      return songs;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getInfo(query: string): Promise<YouTubeSong[]> {
    const info = await downloader.getInfo(query);
    return info.map(song => ({
      id: song.id,
      title: song.title,
      thumbnail: song.thumbnails[0].url,
      channel: song.artists![0].name,
      url: "https://www.youtube.com/watch?v=" + song.id,
      duration: song.duration.seconds,
    }));
  }
}
