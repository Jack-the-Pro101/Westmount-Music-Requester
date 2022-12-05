import { Injectable } from "@nestjs/common";
import { SpotifySearch, TrackSourceInfo, YouTubeSong } from "src/types";

import downloader from "../downloader/downloader";

@Injectable()
export class MusicService {
  private spotifyToken: string;

  private async refreshSpotifyToken() {
    const payload = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_SECRET}`, "utf-8").toString("base64");

    const request = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: new URLSearchParams(
        Object.entries({
          grant_type: "client_credentials",
        })
      ).toString(),
      headers: {
        Authorization: "Basic " + payload,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await request.json();
    this.spotifyToken = data.access_token;
  }
  async search(query: string) {
    try {
      if (!this.spotifyToken) await this.refreshSpotifyToken();

      const request = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
        headers: {
          Authorization: "Bearer " + this.spotifyToken,
        },
      });

      if (!request.ok) {
        const response = await request.json();

        if (response.error.status === 401) {
          await this.refreshSpotifyToken();
          return await this.search(query);
        }
      }

      const response = (await request.json()) as SpotifySearch;

      const songs = response.tracks.items;

      return songs;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getSource(id: string): Promise<TrackSourceInfo> {
    return await downloader.getSource(id);
  }

  async getInfo(query: string): Promise<YouTubeSong[]> {
    const info = await downloader.getInfo(query);

    return info.map((song) => ({
      id: song.id,
      title: song.title,
      thumbnail: song.thumbnails[0].url,
      channel: song.artists[0]?.name || "[YT MUSIC - UNKNOWN]",
      url: "https://www.youtube.com/watch?v=" + song.id,
      duration: song.duration.seconds,
    }));
  }
}
