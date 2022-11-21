import { useEffect, useState } from "react";
import { CoreSong, TrackSourceInfo, YouTubeSong } from "../../types";
import styles from "./Requests.module.css";

import { PlayRange } from "./PlayRange";

export function Requests({ selectedCoreSong }: { selectedCoreSong?: CoreSong }) {
  const [isLoading, setIsLoading] = useState(false);
  const [trackResults, setTrackResults] = useState<YouTubeSong[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<YouTubeSong>();
  const [selectedTrackSource, setSelectedTrackSource] = useState<TrackSourceInfo>();

  useEffect(() => {
    setIsLoading(true);

    loadSongs();
  }, [selectedCoreSong]);

  useEffect(() => {
    if (!selectedTrack) return;
    (async () => {
      const request = await fetch("/api/music/source?id=" + selectedTrack.id);

      if (request.ok) {
        setSelectedTrackSource(await request.json());
      }
    })();
  }, [selectedTrack]);

  async function loadSongs() {
    if (selectedCoreSong) {
      const urlParams = new URLSearchParams();
      urlParams.append("songId", selectedCoreSong.id.toString());

      const request = await fetch("/api/music/info?song=" + selectedCoreSong.artist + " " + selectedCoreSong.title);

      if (request.ok) {
        const response = (await request.json()) as YouTubeSong[];
        setTrackResults(response);

        setIsLoading(false);
      }
    }
  }

  async function submitRequest(e: Event) {
    e.preventDefault();

    await fetch("/api/requests", {
      method: "POST",
      body: JSON.stringify({
        geniusId: selectedCoreSong?.id,
        youtubeId: selectedTrack?.id,
        playRange: 0,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return (
    <div className={styles.requests}>
      <form action="#" method="post" className={styles.requests__form} onSubmit={(e) => submitRequest(e)}>
        <h2 className={styles.requests__heading}>Submit request</h2>

        <p>{selectedCoreSong?.title}</p>
        <p>{selectedCoreSong?.artist}</p>

        <ul className={styles.requests__list}>
          {trackResults.map((track) => (
            <li className={styles.requests__item} key={track.id}>
              <div className={styles.requests__thumbnail}>
                <a href={track.url} target="_blank" rel="noopener noreferrer">
                  <img src={track.thumbnail} alt={track.title + "'s thumbnail"} className={styles["requests__thumbnail-image"]} />
                </a>
              </div>
              <div className={styles.requests__info}>
                <h4 className={styles.requests__title}>{track.title}</h4>
                <p className={styles.requests__channel}>{track.channel}</p>
              </div>

              <button className={styles["requests__select-btn"]} onClick={() => setSelectedTrack(track)} type="button">
                <i class="fa-regular fa-check"></i>
              </button>
            </li>
          ))}
        </ul>

        <fieldset className={styles.requests__fieldset}>
          <h2 className={styles.requests__heading}>Select play range</h2>
          {selectedTrackSource && <PlayRange songDuration={selectedTrack?.duration || 0} songPreview={selectedTrackSource} />}
        </fieldset>

        <div className={styles.requests__btns}>
          <button type="reset" disabled={!selectedTrack || Object.keys(selectedTrack).length === 0 ? false : true} className={styles.requests__btn}>
            Cancel
          </button>
          <button type="submit" disabled={!selectedTrack || Object.keys(selectedTrack).length === 0 ? true : false} className={styles.requests__btn}>
            Request
          </button>
        </div>
      </form>

      <h2 className={styles.requests__heading}>Your requests</h2>
    </div>
  );
}
