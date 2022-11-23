import { TargetedEvent } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import { TrackSourceInfo } from "../../types";
import styles from "./Requests.module.css";

export function PlayRange({ songPreview }: { songPreview: TrackSourceInfo; songDuration: number }) {
  const accuracyConstant = 2;
  const songMaxPlayDurationSeconds = 60 * accuracyConstant;

  const [playbackPos, setPlaybackPos] = useState(0);
  const [selectionRange, setSelectionRange] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);

  const audioElemRef = useRef<HTMLAudioElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);

  function updatePlaybackPos(event: any) {
    setPlaybackPos(event.target.currentTime * accuracyConstant);
  }

  function updatePlaybackPosRange(event: TargetedEvent<HTMLInputElement, Event>): void;

  function updatePlaybackPosRange(time: number): void;

  function updatePlaybackPosRange(input: TargetedEvent<HTMLInputElement, Event> | number) {
    if (typeof input === "number") {
      audioElemRef.current!.currentTime = input / accuracyConstant;
    } else {
      audioElemRef.current!.currentTime = Number((input.target as HTMLInputElement).value) / accuracyConstant;
    }
  }

  function updateSelctionRangePos(time: number) {
    if (rangeRef) rangeRef.current!.value = (time + (time / duration) * songMaxPlayDurationSeconds * (-0.0029 * duration + 2.3)).toString();
    // C = AB - A
    // currentSel * (songMaxPlayDurationSeconds / songDuration) - currentSel;

    setSelectionRange(time);
  }

  useEffect(() => {
    if (audioElemRef.current) isPlaying ? audioElemRef.current.pause() : audioElemRef.current.play();
  }, [isPlaying]);

  useEffect(() => {
    if (audioElemRef.current) isPlaying ? audioElemRef.current.pause() : audioElemRef.current.play();
  }, [songPreview]);

  useEffect(() => {
    const handler = () => {
      setDuration(audioElemRef.current ? audioElemRef.current.duration * accuracyConstant : 0);
    };
    if (audioElemRef) {
      audioElemRef.current?.addEventListener("loadedmetadata", handler);
    }

    return () => audioElemRef?.current?.removeEventListener("loadedmetadata", handler);
  }, [audioElemRef]);

  function secondsToHumanReadableString(seconds: number) {
    seconds /= accuracyConstant;
    const sliceRange = seconds > 60 * 60 ? [11, 19] : [14, 19];

    const time = new Date(seconds * 1000).toISOString().slice(...sliceRange);

    if (seconds >= 60) return time.replace(/^[0:]+/, "");
    return time;
  }

  return (
    <div className={styles["requests__play-range"]}>
      {songPreview && (
        <audio src={songPreview.url} onTimeUpdate={updatePlaybackPos} onEnded={() => setIsPlaying(true)} ref={audioElemRef} volume={volume}>
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
        max={duration}
      />
      <input
        type="range"
        name="range"
        id="range"
        className={`${styles["requests__play-range-input"]} ${styles["requests__play-range-input--duration"]}`}
        min={0}
        max={duration}
        ref={rangeRef}
        onChange={(e) => {
          const currentSel = Number((e.target as HTMLInputElement).value);

          setSelectionRange(currentSel - (currentSel / duration) * songMaxPlayDurationSeconds);
        }}
        style={`--thumb-width: ${(songMaxPlayDurationSeconds / duration) * 100}%`}
      />

      <div className={`${styles["requests__play-controller"]} ${styles["requests__play-btns"]}`}>
        <div className={styles["requests__play-btns-group"]}>
          <button type="button" className={styles["requests__play-btn"]} onClick={() => setIsPlaying((isPlaying) => (isPlaying ? false : true))}>
            <i class={"fa-regular fa-" + (isPlaying ? "play" : "pause")}></i>
          </button>
        </div>
        <div className={styles["requests__play-btns-group"]}>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updatePlaybackPosRange(selectionRange)}
            title="Jump to start of selected range"
          >
            [
          </button>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updatePlaybackPosRange(selectionRange + songMaxPlayDurationSeconds)}
            title="Jump to end of selected range"
          >
            ]
          </button>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updateSelctionRangePos(playbackPos)}
            title="Set start of selected range to playhead"
          >
            {"{"}
          </button>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updateSelctionRangePos(playbackPos - songMaxPlayDurationSeconds)}
            title="Set end of selected range to playhead"
          >
            {"}"}
          </button>
        </div>
      </div>
      <div className={`${styles["requests__play-controller"]} ${styles["requests__play-volume"]}`}>
        <label htmlFor="volume">Volume</label>
        <i className="fa-regular fa-volume"></i>
        <input
          type="range"
          name="volume"
          id="volume"
          min={0}
          max={100}
          value={volume * 100}
          onChange={(e) => setVolume((e.target as HTMLInputElement).valueAsNumber / 100)}
        />
      </div>
      <div className={`${styles["requests__play-controller"]} ${styles["requests__play-time"]}`}>
        <p className={styles["requests__play-text"]}>
          {secondsToHumanReadableString(playbackPos)} / {secondsToHumanReadableString(duration)}
        </p>
        <p className={styles["requests__play-text"]}>
          Selection range: {secondsToHumanReadableString(selectionRange)}-{secondsToHumanReadableString(selectionRange + songMaxPlayDurationSeconds)}
        </p>
      </div>
    </div>
  );
}
