import { TargetedEvent } from "preact/compat";
import { useRef, useState } from "preact/hooks";
import { TrackSourceInfo } from "../../types";
import styles from "./Requests.module.css";

export function PlayRange({ songPreview, songDuration }: { songPreview: TrackSourceInfo; songDuration: number }) {
  const songMaxPlayDurationSeconds = 60;

  const [playbackPos, setPlaybackPos] = useState(0);
  const audioElemRef = useRef();

  function updatePlaybackPos(event: any) {
    setPlaybackPos(event.target.currentTime);
  }

  function updatePlaybackPosRange(event: any) {
    // if (event.target.value === playbackPos) return;

    audioElemRef.current.currentTime = event.target.value;
  }

  return (
    <div className={styles["requests__play-range"]}>
      {songPreview && (
        <audio src={songPreview.url} controls style="margin: 2em 0" onTimeUpdate={updatePlaybackPos} ref={audioElemRef}>
          <source src={songPreview.url} type={songPreview.mime_type} />
        </audio>
      )}

      <label htmlFor="range" className={styles["requests__play-range-label"]} draggable={true} role="slider" />
      <label htmlFor="track-scrubber" className={styles["requests__play-range-scrubber-label"]}></label>

      <input
        type="range"
        name="track-scrubber"
        id="track-scrubber"
        className={`${styles["requests__play-range-input"]} ${styles["requests__play-range-input--scrubber"]}`}
        value={playbackPos}
        onChange={updatePlaybackPosRange}
        max={songDuration}
      />
      <input
        type="range"
        name="range"
        id="range"
        className={`${styles["requests__play-range-input"]} ${styles["requests__play-range-input--duration"]}`}
        max={songDuration}
        style={`--thumb-width: ${(songMaxPlayDurationSeconds / songDuration) * 100}%`}
      />
    </div>
  );
}
