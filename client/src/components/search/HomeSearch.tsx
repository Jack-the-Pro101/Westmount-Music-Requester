import { useEffect, useState } from "preact/hooks";

import { CoreSong, SpotifyTrack } from "../../types";
import { SearchDropdown } from "./SearchDropdown";

import styles from "./HomeSearch.module.css";
import { BASE_URL } from "../../env";

function statusCodeToMessage(code: number) {
  switch (code) {
    case 429:
      return "Slow down, you are sending requests too fast!";
    default:
      return "";
  }
}

export default function HomeSearch({ setSelectedCoreSong }: { setSelectedCoreSong: (value: CoreSong) => void }) {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [autoSearch, setAutoSearch] = useState<number | null>(null);
  const [songs, setSongs] = useState<SpotifyTrack[]>([]);
  const [isEmpty, setIsEmpty] = useState(false);

  function updateSearch(text: string) {
    setSearch(text);
    setSongs([]);
    setIsEmpty(false);
  }

  // Auto search code, disabled until further notice due to Spotify API rate limit concerns

  // useEffect(() => {
  //   if (!search.trim()) return;

  //   const autoSearch = setTimeout(() => {
  //     handleSubmit();
  //   }, 1000);

  //   return () => clearTimeout(autoSearch);
  // }, [search]);

  async function handleSubmit(e?: Event) {
    e?.preventDefault();

    // if (isLoading) return;

    setIsLoading(true);

    const request = await fetch(`${BASE_URL}/api/music/search?query=${search}`);

    if (request.ok) {
      const data = (await request.json()) as SpotifyTrack[];

      setSongs(data);
      if (data.length === 0) {
        setIsEmpty(true);
      } else {
        setIsEmpty(false);
      }
    } else {
      setIsEmpty(true);

      alert(`Request failed: code ${request.status}\n\n${statusCodeToMessage(request.status)}`);
    }

    setIsLoading(false);
  }

  function songSelected(data: CoreSong) {
    setSearch("");
    setSongs([]);
    setIsEmpty(false);
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
        <SearchDropdown songs={songs} onSelect={songSelected} isLoading={isLoading} isEmpty={isEmpty} />
        {/* <div className={styles["search__dropdown-filler"]}></div> */}
      </form>
    </div>
  );
}
