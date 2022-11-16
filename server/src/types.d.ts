export interface CoreSong {
  title: string;
  artist: string;
  url: string;
  id: number;
}

export type Hits = Hit[];

export interface Hit {
  index: string;
  type: string;
  result: Song;
}

export interface Song {
  title: string;
  artist_names: string;
  song_art_image_thumbnail_url: string;
  id: number;
  url: string;
}

export interface YouTubeSong {
  id: track.id;
  title: string;
  thumbnail: string;
  channel: string;
  url: string;
  duration: number;
}

export interface GoogleUserInfo {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export type GoogleUser = {
  // iat: number;
  user: GoogleUserInfo;
};

export interface TrackSourceInfo {
  url: string;
  mime_type: string;
  format: string;
}

export interface RequestData {
  geniusId: string;
  youtubeId: string;
  playRange: number;
}
