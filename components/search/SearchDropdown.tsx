import styles from "./HomeSearch.module.css";

type Hits = Hit[];

interface Hit {
  index: string;
  type: string;
  result: Song;
}

interface Song {
  title: string;
  artist_names: string;
  song_art_image_thumbnail_url: string;
  id: number;
  url: string;
}

export default function SearchDropdown({ songs, onSelect, isLoading }: { songs: Hits; onSelect: any; isLoading: boolean }) {
  return (
    <ul className={styles.search__dropdown}>
      {songs.length === 0 ? (
        isLoading ? (
          <li className={styles["search__dropdown-loading"]}>Loading</li>
        ) : null
      ) : (
        songs
          .filter((song: Hit) => song.type === "song")
          .map((hit) => hit.result)
          .map((song: Song) => (
            <li className={styles["search__dropdown-item"]} key={song.id}>
              <div className={styles["search__dropdown-img-container"]}>
                <a href={song.url} target="_blank" rel="noopener noreferrer">
                  <img src={song.song_art_image_thumbnail_url} alt={song.title + "'s cover image"} />
                </a>
              </div>
              <div className={styles["search__dropdown-text"]}>
                <a href={song.url} target="_blank" rel="noopener noreferrer">
                  <h4 className={styles["search__dropdown-title"]}>{song.title}</h4>
                </a>
                <p className={styles["search__dropdown-artist"]}>{song.artist_names}</p>
              </div>
              <button
                className={styles["search__dropdown-select-btn"]}
                onClick={(e) => onSelect({ title: song.title, artist: song.artist_names, id: song.id, url: song.url })}
              >
                Select
              </button>
            </li>
          ))
      )}
    </ul>
  );
}
