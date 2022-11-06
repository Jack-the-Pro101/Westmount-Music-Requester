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
