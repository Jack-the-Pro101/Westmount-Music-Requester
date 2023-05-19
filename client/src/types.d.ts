export interface CoreSong {
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
  id: string;
}

export interface StoredUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  avatar: string;
  type: "GOOGLE" | "INTERNAL";
  permissions: number;
  name: string;
  [key: string];
}

export interface StoredTrack {
  _id: string;
  title: string;
  artist: string;
  cover: string;
  explicit: boolean;
  youtubeId: string;
}

export interface Request {
  _id: string;
  spotifyId: string;
  track: StoredTrack;
  start: number;
  user: StoredUser;
  createdAt: string;
  updatedAt: string;
  status: "AWAITING" | "PENDING" | "PENDING_MANUAL" | "AUTO_REJECTED" | "REJECTED" | "ACCEPTED";

  popularity: number;
}

export interface YouTubeSong {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  url: string;
  duration: number;
}

export interface TrackSourceInfo {
  duration: number;
  url: string;
  mime_type: string;
  format: string;
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
