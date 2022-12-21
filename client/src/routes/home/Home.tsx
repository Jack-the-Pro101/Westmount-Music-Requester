import { useEffect, useState } from "react";

import HomeSearch from "../../components/search/HomeSearch";
import { Requests } from "../../components/requests/Requests";

import styles from "./Home.module.css";
import { CoreSong, Request } from "../../types";

import { maxSongsPerCycle } from "../../shared/config.json";

export function Home() {
  const [selectedCoreSong, setSelectedCoreSong] = useState<CoreSong>();
  const [currentRequests, setCurrentRequests] = useState<Request[]>([]);

  useEffect(() => {
    (async () => {
      const requests = await fetch("/api/requests/me");

      if (requests.ok) {
        const requestsJson = (await requests.json()) as Request[];

        if (requestsJson.length >= maxSongsPerCycle) {
          alert("You have reached the maximum amount of requests this cycle. Redirecting...");
          return (window.location.href = "/myrequests");
        }

        setCurrentRequests(requestsJson);
      }
    })();
  }, []);

  function setSelectedCoreSongRelay(coreSong: CoreSong) {
    if (currentRequests.some((request) => request.spotifyId === coreSong.id))
      return alert("You have already requested this track and cannot request it again this cycle.");

    setSelectedCoreSong(coreSong);
  }

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
          <HomeSearch setSelectedCoreSong={setSelectedCoreSongRelay} />
        </div>
        <div className={styles.main__requester}>
          <Requests selectedCoreSong={selectedCoreSong} setSelectedCoreSong={setSelectedCoreSong} currentRequests={currentRequests} />
        </div>
      </main>
    </>
  );
}
