import { TargetedEvent } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import { TrackSourceInfo } from "../../types";
import styles from "./Requests.module.css";

export function PlayRange({ songPreview, songDuration }: { songPreview: TrackSourceInfo; songDuration: number }) {
  const songMaxPlayDurationSeconds = 60;

  const [playbackPos, setPlaybackPos] = useState(0);
  const [selectionRange, setSelectionRange] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioElemRef = useRef<HTMLAudioElement>(null);

  function updatePlaybackPos(event: any) {
    setPlaybackPos(event.target.currentTime);
  }

  function updatePlaybackPosRange(event: TargetedEvent<HTMLInputElement, Event>): void;

  function updatePlaybackPosRange(time: number): void;

  function updatePlaybackPosRange(input: TargetedEvent<HTMLInputElement, Event> | number) {
    if (typeof input === "number") {
      audioElemRef.current!.currentTime = input;
    } else {
      audioElemRef.current!.currentTime = Number((input.target as HTMLInputElement).value);
    }
  }

  useEffect(() => {
    if (audioElemRef.current) isPlaying ? audioElemRef.current.pause() : audioElemRef.current.play();
  }, [isPlaying]);

  useEffect(() => {
    if (audioElemRef.current) isPlaying ? audioElemRef.current.pause() : audioElemRef.current.play();
  }, [songPreview]);

  return (
    <div className={styles["requests__play-range"]}>
      {songPreview && (
        <audio src={songPreview.url} onTimeUpdate={updatePlaybackPos} onEnded={() => setIsPlaying(false)} ref={audioElemRef} volume={volume}>
          <source src={songPreview.url} type={songPreview.mime_type} />
        </audio>
      )}

      <label htmlFor="range" className={styles["requests__play-range-label"]}></label>
      <label htmlFor="track-scrubber" className={styles["requests__play-range-scrubber-label"]}></label>

      <input
        type="range"
        name="track-scrubber"
        id="track-scrubber"
        className={`${styles["requests__play-range-input"]} ${styles["requests__play-range-input--scrubber"]}`}
        value={playbackPos}
        onChange={updatePlaybackPosRange}
        min={0}
        max={songDuration}
      />
      <input
        type="range"
        name="range"
        id="range"
        className={`${styles["requests__play-range-input"]} ${styles["requests__play-range-input--duration"]}`}
        min={0}
        max={songDuration}
        onChange={(e) => {
          const currentSel = Number((e.target as HTMLInputElement).value);

          setSelectionRange(currentSel - (currentSel / songDuration) * songMaxPlayDurationSeconds);
        }}
        style={`--thumb-width: ${(songMaxPlayDurationSeconds / songDuration) * 100}%`}
      />

      <div className={styles["requests__play-btns"]}>
        <div className={styles["requests__play-btns-group"]}>
          <button className={styles["requests__play-btn"]} onClick={() => setIsPlaying((isPlaying) => !isPlaying)}>
            <i class={"fa-regular fa-" + (isPlaying ? "play" : "pause")}></i>
          </button>
        </div>
        <div className={styles["requests__play-btns-group"]}>
          <button className={styles["requests__play-btn"]} onClick={() => updatePlaybackPosRange(selectionRange)}>
            [
          </button>
          <button className={styles["requests__play-btn"]} onClick={() => updatePlaybackPosRange(selectionRange + songMaxPlayDurationSeconds)}>
            ]
          </button>
        </div>
      </div>
      <div className={styles["requests__play-volume"]}>
        <label htmlFor="volume">Volume</label>
        <i className="fa-regular fa-volume"></i>
        <input type="range" name="volume" id="volume" min={0} max={100} onChange={(e) => setVolume(e.target!.valueAsNumber / 100)} />
      </div>
      <div className={styles["requests__play-time"]}>
        <p className={styles["requests__play-text"]}>
          {Math.round(playbackPos)} / {songDuration}
        </p>
        <p className={styles["requests__play-text"]}>
          Selection range: {Math.round(selectionRange)}-{Math.round(selectionRange + songMaxPlayDurationSeconds)}
        </p>
      </div>
    </div>
  );
}
