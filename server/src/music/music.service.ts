import { Injectable } from "@nestjs/common";
import { SpotifySearch, SpotifyTrack, TrackSourceInfo, YouTubeSong } from "../types";

import downloader from "../downloader/downloader";

@Injectable()
export class MusicService {
  private spotifyToken?: string;
  private spotifyTokenRefreshing = false;

  private async refreshSpotifyToken() {
    this.spotifyTokenRefreshing = true;
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
    this.spotifyTokenRefreshing = false;
  }
  async searchSpotify(query: string): Promise<SpotifyTrack[]> {
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
        } else {
          return [];
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

  async getYtSource(id: string, excludeFormats: string[]): Promise<TrackSourceInfo | false> {
    return await downloader.getSource(id, excludeFormats);
  }

  async searchYt(query: string): Promise<YouTubeSong[]> {
    const info = await downloader.searchYt(query);

    if (info == null) return [];

    info.splice(4);

    return (
      info
        .filter((song) => song.id)
        // .filter((song) => song.id && (song.badges.length === 0 ? true : !song.badges.some((badge) => badge.icon_type === "MUSIC_EXPLICIT_BADGE")))
        .map((song) => ({
          id: song.id!,
          title: song.title ?? "[Unknown]",
          thumbnail: song.thumbnails[0].url,
          channel: song.artists?.[0]?.name || "[Unknown]",
          url: "https://music.youtube.com/watch?v=" + song.id,
          duration: song.duration?.seconds || 0,
        }))
    );
  }
}
