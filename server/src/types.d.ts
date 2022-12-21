export interface CoreSong {
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
  id: number;
}

export interface YouTubeSong {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  url: string;
  duration: number;
}

export interface StoredUser {
  _id: string;
  id: string;
  email: string;
  username: string;
  password: string;
  avatar: string;
  type: "GOOGLE" | "INTERNAL";
  permissions: number;
  name: string;
  [key: string];
}

export interface GoogleUserInfo {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export type GoogleUser = {
  user: GoogleUserInfo;
};

export interface TrackSourceInfo {
  url: string;
  duration: number;
  mime_type: string;
  format: string;
}

export interface RequestData {
  spotifyId: string;
  youtubeId: string;
  playRange: number;
}

export interface Request {
  _id: string;
  spotifyId: string;
  track: StoredTrack;
  start: number;
  user: StoredUser;
  createdAt: string;
  updatedAt: string;
  status: "PRE_PENDING" | "PENDING" | "PENDING_MANUAL" | "AUTO_REJECTED" | "REJECTED" | "ACCEPTED";

  popularity: number;
}

export interface SpotifyArtist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface SpotifyAlbumImage {
  height: number;
  width: number;
  url: string;
}

export interface SpotifyTrack {
  album: {
    album_type: string;
    artists: SpotifyArtist[];
    available_markets: string[];
    external_urls: Object[];
    href: string;
    id: string;
    images: SpotifyAlbumImage[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
  };
  artists: SpotifyArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: { isrc: string };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export interface SpotifySearch {
  tracks: {
    href: string;
    items: SpotifyTrack[];
    limit: number;
    next: string;
    offset: number;
    previous: string | null;
    total: number;
  };
}

export interface FfmpegPostProcessOptions {
  format: string;
  codec: string;
  start: number;
  end: number;
}
