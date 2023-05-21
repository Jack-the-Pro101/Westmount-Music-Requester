import { useEffect, useRef, useState } from "react";

import HomeSearch from "../../components/search/HomeSearch";
import { Requests } from "../../components/requests/Requests";

import styles from "./Home.module.css";
import { CoreSong, Request } from "../../types";

import { maxSongsPerCycle } from "../../shared/config.json";
import { useNavigate } from "react-router-dom";

import { version } from "../../../package.json";

export function Home() {
  const [selectedCoreSong, setSelectedCoreSong] = useState<CoreSong>();
  const [currentRequests, setCurrentRequests] = useState<Request[]>([]);
  const requestsRef = useRef<HTMLDivElement>(null);

  const [canRequest, setCanRequest] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const requests = await fetch("/api/requests/me");

      if (requests.ok) {
        const requestsJson = (await requests.json()) as Request[];

        if (requestsJson.length >= maxSongsPerCycle) {
          setCanRequest(false);
        }

        setCurrentRequests(requestsJson);
      }
    })();
  }, []);

  function setSelectedCoreSongRelay(coreSong: CoreSong) {
    if (currentRequests.some((request) => request.spotifyId === coreSong.id))
      return alert("You have already requested this track and cannot request it again this cycle.");

    setSelectedCoreSong(coreSong);
    requestsRef.current!.scrollIntoView();
  }

  return (
    <>
      <main
        className={styles.main}
        style={`--cover-img: ${selectedCoreSong != null ? `url("${selectedCoreSong.coverUrl}")` : ""}`}
      >
        <div className={styles.main__searcher}>
          <header className={styles.header}>
            <h1 className={styles.header__title}>
              <span className={styles.header__gradient}>Westmount</span>
              <wbr /> Music Requester
              <a href="/help#beta" className={styles.header__version}>
                BETA v{version}
              </a>
            </h1>
          </header>
          <HomeSearch setSelectedCoreSong={setSelectedCoreSongRelay} />
        </div>
        <div className={styles.main__requester} ref={requestsRef}>
          <Requests
            selectedCoreSong={selectedCoreSong}
            setSelectedCoreSong={setSelectedCoreSong}
            currentRequests={currentRequests}
            canRequest={canRequest}
          />
        </div>
      </main>
    </>
  );
}
