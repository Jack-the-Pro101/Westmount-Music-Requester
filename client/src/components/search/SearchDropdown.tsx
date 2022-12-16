import { CoreSong, SpotifyTrack } from "../../types";
import styles from "./HomeSearch.module.css";

interface Props {
  songs: SpotifyTrack[]; 
  onSelect: (data: CoreSong) => void; 
  isLoading: boolean; 
}

export function SearchDropdown({ songs, onSelect, isLoading }: Props) {
  return (
    <ul className={styles.search__dropdown}>
      {songs.length === 0 ? (
        isLoading ? (
          <li className={styles["search__dropdown-loading"]}>Finding music</li>
        ) : null
      ) : (
        songs
          .filter((song: SpotifyTrack) => song.explicit === false)
          .map((song: SpotifyTrack) => (
            <li className={styles["search__dropdown-item"]} key={song.id}>
              <div className={styles["search__dropdown-img-container"]}>
                <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                  <img src={song.album.images[0].url} alt={song.name + "'s cover image"} />
                </a>
              </div>
              <div className={styles["search__dropdown-text"]}>
                <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                  <h4 className={styles["search__dropdown-title"]}>{song.name}</h4>
                </a>
                <p className={styles["search__dropdown-artist"]}>{song.artists[0].name}</p>
              </div>
              <button
                className={styles["search__dropdown-select-btn"]}
                onClick={(e) =>
                  onSelect({ title: song.name, artist: song.artists[0].name, id: song.id, url: song.external_urls.spotify, coverUrl: song.album.images[0].url })
                }
              >
                Select
              </button>
            </li>
          ))
      )}
    </ul>
  );
}
