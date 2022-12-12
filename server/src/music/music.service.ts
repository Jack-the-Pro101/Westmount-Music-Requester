import { Injectable } from "@nestjs/common";
import { SpotifySearch, SpotifyTrack, TrackSourceInfo, YouTubeSong } from "src/types";

import downloader from "../downloader/downloader";

@Injectable()
export class MusicService {
  private spotifyToken: string;
  private spotifyTokenRefreshing = false;

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
  async searchSpotify(query: string) {
    try {
      if (!this.spotifyToken && !this.spotifyTokenRefreshing) await this.refreshSpotifyToken();

      const request = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
        headers: {
          Authorization: "Bearer " + this.spotifyToken,
        },
      });

      if (!request.ok) {
        const response = await request.json();

        if (response.error.status === 401) {
          if (!this.spotifyTokenRefreshing) await this.refreshSpotifyToken();
          return await this.searchSpotify(query);
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

  async getSpotifyTrack(spotifyTrackId: string): Promise<SpotifyTrack> {
    if (!this.spotifyToken && !this.spotifyTokenRefreshing) await this.refreshSpotifyToken();

    const request = await fetch("https://api.spotify.com/v1/tracks/" + spotifyTrackId, {
      headers: {
        Authorization: "Bearer " + this.spotifyToken,
      },
    });

    if (!request.ok) {
      const response = await request.json();

      if (response.error.status === 401) {
        if (!this.spotifyTokenRefreshing) await this.refreshSpotifyToken();
        return await this.getSpotifyTrack(spotifyTrackId);
      }
    }

    return (await request.json()) as SpotifyTrack;
  }

  async getYtSource(id: string): Promise<TrackSourceInfo | false> {
    return await downloader.getSource(id);
  }

  async searchYt(query: string): Promise<YouTubeSong[]> {
    const info = await downloader.searchYt(query);

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
