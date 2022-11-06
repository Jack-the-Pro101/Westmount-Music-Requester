"use client";

import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";

import SearchDropdown from "./SearchDropdown";

import styles from "./HomeSearch.module.css";
import { CoreSong } from "../../types/songtypes";

export default function HomeSearch({ setSelectedCoreSong }: { setSelectedCoreSong: (value: CoreSong) => void }) {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState([]);

  function updateSearch(text: string) {
    setSearch(text);
    setSongs([]);
  }

  async function handleSubmit(e: FormEvent | null, recur = 1, recurAccum = []) {
    e?.preventDefault();

    setIsLoading(true);

    const request = await fetch("/api/music/search?q=" + search + "&page=" + recur);

    if (request.ok) {
      const data = await request.json();

      if (recur === 1) setSongs(data.response.hits);

      // if (data.response.hits.length === 10 && recur === 1) {
      //   handleSubmit(null, 2, data.response.hits);
      // } else if (data.response.hits.length === 10 && recur === 2) {
      //   handleSubmit(null, 3, [...recurAccum, data.response.hits]);
      // } else {
      //   setSongs([...songs, ...recurAccum, ...data.response.hits]);
      // }
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
        <div className={styles.search__container}>
          <div className={styles.search__bar}>
            <input
              type="text"
              name="search-music"
              id="search-music"
              className={styles.search__input}
              required
              value={search}
              maxLength={100}
              onChange={(e) => updateSearch(e.target.value)}
            />
            <label htmlFor="search-input" className={styles.search__label}>
              Search music
            </label>
          </div>

          <button type="submit" className={styles.search__btn}>
            Search
          </button>
        </div>
        <SearchDropdown songs={songs} onSelect={songSelected} isLoading={isLoading} />
      </form>
    </div>
  );
}
