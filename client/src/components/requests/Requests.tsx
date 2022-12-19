import { useEffect, useState } from "react";
import { CoreSong, TrackSourceInfo, YouTubeSong } from "../../types";
import styles from "./Requests.module.css";

import { PlayRange } from "./PlayRange";
import { fetchRetry } from "../../utils";
import { useNavigate } from "react-router-dom";

export function Requests({ selectedCoreSong, setSelectedCoreSong }: { selectedCoreSong?: CoreSong; setSelectedCoreSong: Function }) {
  const [isLoading, setIsLoading] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [confirmModalShown, setConfirmModalShown] = useState(false);
  const [trackResults, setTrackResults] = useState<YouTubeSong[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<YouTubeSong>();
  const [selectedTrackSource, setSelectedTrackSource] = useState<TrackSourceInfo>();

  const [selectionRange, setSelectionRange] = useState(0);

  const redirector = useNavigate();

  useEffect(() => {
    if (selectedCoreSong) {
      const aborter = new AbortController();

      setIsLoading(true);

      loadSongs(aborter);

      return () => {
        aborter.abort();
        setIsLoading(false);
      };
    }
  }, [selectedCoreSong]);

  useEffect(() => {
    if (!selectedTrack) return;

    const aborter = new AbortController();

    (async () => {
      const request = await fetchRetry(5, "/api/music/source?id=" + selectedTrack.id, {
        signal: aborter.signal,
      });
      if (!request) return alert("Failed to fetch song from YouTube");

      setSelectedTrackSource(await request.json());
    })();

    return () => aborter.abort();
  }, [selectedTrack]);

  async function loadSongs(aborter: AbortController) {
    const urlParams = new URLSearchParams();
    urlParams.append("songId", selectedCoreSong!.id.toString());

    const request = await fetchRetry(5, "/api/music/info?song=" + selectedCoreSong!.artist + " " + selectedCoreSong!.title, {
      signal: aborter.signal,
    });

    if (!request) return alert("Failed to fetch songs from YouTube");

    const response = (await request.json()) as YouTubeSong[];
    if (response.length > 0) setSelectedTrack(response[0]);
    setTrackResults(response);

    setIsLoading(false);
  }

  async function submitRequest() {
    const request = await fetch("/api/requests", {
      method: "POST",
      body: JSON.stringify({
        spotifyId: selectedCoreSong?.id,
        youtubeId: selectedTrack?.id,
        playRange: selectionRange,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (request.ok) {
      redirector("/myrequests");
    } else {
      alert("Failed to submit request");
    }
  }

  function confirmRequest(e: Event) {
    e.preventDefault();

    setConfirmModalShown(true);
  }

  return (
    <div className={styles.requests}>
      <form action="#" method="post" className={styles.requests__form} onSubmit={(e) => confirmRequest(e)}>
        <h2 className={styles.requests__heading}>Submit request</h2>

        {selectedCoreSong != null && (
          <p className={styles.requests__subtitle}>
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                Found {trackResults.length} results for "{selectedCoreSong?.artist} - {selectedCoreSong?.title}" from{" "}
                <a
                  href={"https://music.youtube.com/search?q=" + `${selectedCoreSong?.artist} ${selectedCoreSong?.title}`.replace(/ /g, "+")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube Music
                </a>
              </>
            )}
          </p>
        )}

        <button
          className={styles["requests__dropdown-btn"]}
          disabled={selectedTrack == null}
          onClick={() => setModalShown(true)}
          type="button"
          title="Show music sources modal"
        >
          {(!selectedCoreSong || isLoading) && (
            <div className={styles.requests__load}>
              {!isLoading ? <p>No track selected from search</p> : <img src="/images/loading.svg" alt="Loading" className={styles["requests__load-img"]} />}
            </div>
          )}
          {selectedTrack && !isLoading && (
            <>
              <div className={styles.requests__thumbnail}>
                <a href={selectedTrack.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={selectedTrack.thumbnail}
                    alt={selectedTrack.title + "'s thumbnail"}
                    referrerpolicy="no-referrer"
                    className={styles["requests__thumbnail-image"]}
                  />
                </a>
              </div>
              <div className={styles["requests__dropdown-info"]}>
                <h4 className={styles.requests__title}>{selectedTrack.title}</h4>
                <p className={styles.requests__channel}>{selectedTrack.channel}</p>
              </div>
              <div className={styles["requests__dropdown-icon"]}>
                <i class="fa-solid fa-caret-down"></i>
              </div>
            </>
          )}
        </button>

        <div className={styles.requests__modal + (modalShown ? " " + styles["requests__modal--shown"] : "")}>
          <div className={styles["requests__modal-popup"]}>
            <h3 className={styles["requests__modal-title"]}>Select source</h3>
            <button className={styles["requests__modal-close"]} title="Close modal" type="button" onClick={() => setModalShown(false)}>
              <i class="fa-regular fa-xmark"></i>
            </button>
            <ul className={styles.requests__list}>
              {trackResults.map((track) => {
                if (selectedTrack != null && track.id === selectedTrack.id) return null;
                return (
                  <li className={styles.requests__item} key={track.id}>
                    <div className={styles.requests__thumbnail}>
                      <a href={track.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={track.thumbnail}
                          alt={track.title + "'s thumbnail"}
                          referrerpolicy="no-referrer"
                          className={styles["requests__thumbnail-image"]}
                        />
                      </a>
                    </div>
                    <div className={styles.requests__info}>
                      <h4 className={styles.requests__title}>{track.title}</h4>
                      <p className={styles.requests__channel}>{track.channel}</p>
                    </div>

                    <button
                      className={styles["requests__select-btn"]}
                      onClick={() => {
                        setSelectedTrack(track);
                        setModalShown(false);
                      }}
                      type="button"
                    >
                      <i class="fa-regular fa-check"></i>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <fieldset className={styles.requests__fieldset} disabled={selectedTrackSource == null}>
          <h2 className={styles.requests__heading}>Select play range</h2>
          <PlayRange songPreview={selectedTrackSource} selectionRange={selectionRange} setSelectionRange={setSelectionRange} editable={true} />
        </fieldset>

        <div className={styles.requests__btns}>
          <button
            type="reset"
            disabled={!selectedTrack || Object.keys(selectedTrack).length === 0 ? true : false}
            className={styles.requests__btn}
            onClick={() => {
              setSelectedTrack(undefined);
              setSelectedTrackSource(undefined);
              setTrackResults([]);
              setSelectedCoreSong(null);
            }}
          >
            Cancel
          </button>
          <button type="submit" disabled={!selectedTrack || Object.keys(selectedTrack).length === 0 ? true : false} className={styles.requests__btn}>
            Request
          </button>
        </div>
      </form>

      <div className={`${styles.requests__confirm} ${confirmModalShown && styles["requests__confirm--active"]}`}>
        <div className={styles["requests__confirm-container"]}>
          <div className={styles["requests__confirm-info"]}>
            <h2>Confirm request</h2>

            <p>You are requesting:</p>

            <ul>
              <li>
                {selectedTrack?.channel}-{selectedTrack?.title}
              </li>
              <li>Will play from {selectionRange}</li>
            </ul>

            <p>You have limited requests per cycle. Ensure you use them correctly. Does the above info. look good?</p>
          </div>

          <div className={styles["requests__confirm-btns"]}>
            <button className={styles["requests__back-btn"]} onClick={() => setConfirmModalShown(false)}>
              Back
            </button>
            <button
              className={styles["requests__confirm-btn"]}
              onClick={() => {
                submitRequest();
                setConfirmModalShown(false);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
