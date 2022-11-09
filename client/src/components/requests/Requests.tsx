import { useEffect, useState } from "react";
import { CoreSong, YoutubeSong } from "../../types";
import styles from "./Requests.module.css";

export function Requests({ selectedCoreSong }: { selectedCoreSong?: CoreSong }) {
  const [trackResults, setTrackResults] = useState<YoutubeSong[]>([]);
  const [selectedTrack, setSelectedTrack] = useState({});

  useEffect(() => {
    async () => {
      if (selectedCoreSong) {
        if (Object.entries(selectedCoreSong).length === 0) return;

        const urlParams = new URLSearchParams();
        urlParams.append("songId", selectedCoreSong.id.toString());

        const request = await fetch("/api/music/getInfo");
      }
    };
  }, [selectedCoreSong]);

  async function submitRequest(e: Event) {
    e.preventDefault();
  }

  return (
    <div className={styles.requests}>
      <form action="#" method="post" className={styles.requests__form} onSubmit={(e) => submitRequest(e)}>
        <h2 className={styles.requests__heading}>Submit request</h2>

        <ul className={styles.requests__list}>
          {trackResults.map((track) => (
            <li className={styles.requests__item}>
              <div className={styles.requests__info}>
                <h4 className={styles.requests__title}>{track.title}</h4>
                <p className={styles.requests__channel}>{track.channel}</p>
              </div>

              <button className={styles["requests__select-btn"]}>✅</button>
            </li>
          ))}
        </ul>

        <div className={styles.requests__btns}>
          <button type="reset" disabled={Object.keys(selectedTrack).length === 0 ? false : true} className={styles.requests__btn}>
            Cancel
          </button>
          <button type="submit" disabled={Object.keys(selectedTrack).length === 0 ? true : false} className={styles.requests__btn}>
            Request
          </button>
        </div>
      </form>

      <h2 className={styles.requests__heading}>Your requests</h2>
    </div>
  );
}
