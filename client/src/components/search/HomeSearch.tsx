import { useState } from "preact/hooks";

import { CoreSong, SpotifyTrack } from "../../types";
import { SearchDropdown } from "./SearchDropdown";

import styles from "./HomeSearch.module.css";

export default function HomeSearch({ setSelectedCoreSong }: { setSelectedCoreSong: (value: CoreSong) => void }) {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<SpotifyTrack[]>([]);

  function updateSearch(text: string) {
    setSearch(text);
    setSongs([]);
  }

  async function handleSubmit(e: Event) {
    e?.preventDefault();

    setIsLoading(true);

    const request = await fetch("/api/music/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: search }),
    });

    if (request.ok) {
      const data = (await request.json()) as SpotifyTrack[];

      setSongs(data);
    } else {
      console.log("Request failed: ", request.status);
    }

    setIsLoading(false);
  }

  function songSelected(data: CoreSong) {
    setSearch("");
    setSongs([]);
    setSelectedCoreSong(data);
  }

  return (
    <div className={styles.search}>
      <form action="#" className={styles.search__form} onSubmit={handleSubmit}>
        <div className={styles.search__container + (songs.length === 0 ? "" : `${" " + styles["search__container--active"]}`)}>
          <div className={styles.search__bar}>
            <input
              type="text"
              name="search-music"
              id="search-music"
              className={styles.search__input}
              required
              value={search}
              maxLength={100}
              onChange={(e) => updateSearch((e.target as HTMLInputElement).value)}
            />
            <label htmlFor="search-music" className={styles.search__label}>
              Search music
            </label>
          </div>

          <button type="submit" className={styles.search__btn} title="Search">
            <i class="fa-regular fa-magnifying-glass"></i>
          </button>
        </div>
        <SearchDropdown songs={songs} onSelect={songSelected} isLoading={isLoading} />
        {/* <div className={styles["search__dropdown-filler"]}></div> */}
      </form>
    </div>
  );
}
