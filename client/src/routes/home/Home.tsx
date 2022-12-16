import { useEffect, useState } from "react";

import HomeSearch from "../../components/search/HomeSearch";
import { Requests } from "../../components/requests/Requests";

import styles from "./Home.module.css";
import { CoreSong } from "../../types";

export function Home() {
  const [selectedCoreSong, setSelectedCoreSong] = useState<CoreSong>();

  return (
    <>
      <main className={styles.main} style={`--cover-img: ${selectedCoreSong != null ? `url("${selectedCoreSong.coverUrl}")` : ""}`}>
        <div className={styles.main__searcher}>
          <header className={styles.header}>
            <h1 className={styles.header__title}>
              <span className={styles.header__gradient}>Westmount</span>
              <wbr /> Music Requester
            </h1>
          </header>
          <HomeSearch setSelectedCoreSong={setSelectedCoreSong} />
        </div>
        <div className={styles.main__requester}>
          <Requests selectedCoreSong={selectedCoreSong} setSelectedCoreSong={setSelectedCoreSong} />
        </div>
      </main>
    </>
  );
}
