import { TargetedEvent } from "preact/compat";
import { StateUpdater, useEffect, useRef, useState } from "preact/hooks";
import { TrackSourceInfo } from "../../types";

import * as config from "../../shared/config.json";
import { secondsToHumanReadableString } from "../../utils";

import styles from "./PlayRange.module.css";

const accuracyConstant = 2;
const songMaxPlayDurationSeconds = config.songMaxPlayDurationSeconds * accuracyConstant;

export function PlayRange({
  songPreview,
  selectionRange,
  setSelectionRange,
  min,
  max,
  editable,
}: {
  songPreview: TrackSourceInfo | undefined;
  selectionRange: number;
  setSelectionRange?: StateUpdater<number>;
  min?: number;
  max?: number;
  editable: boolean;
}) {
  if (min) min *= accuracyConstant;
  if (max) max *= accuracyConstant;

  const [playbackPos, setPlaybackPos] = useState(0);
  const storedVolume = localStorage.getItem("volume") ? parseFloat(localStorage.getItem("volume") as string) : 1;
  const [volume, setVolume] = useState(Number.isNaN(storedVolume) ? 1 : storedVolume);
  const [isPaused, setIsPaused] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isAwaiting, setIsAwaiting] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [buffered, setBuffered] = useState(0);
  const [selectionDisplayRange, setDisplaySelectionRange] = useState(0);

  useEffect(() => {
    localStorage.setItem("volume", volume.toString());
  }, [volume]);

  if (!setSelectionRange) setDisplaySelectionRange(selectionRange * accuracyConstant);

  const audioElemRef = useRef<HTMLAudioElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);

  function updatePlaybackPos(event: Event) {
    if (min != null && playbackPos < min) {
      updatePlaybackPosRange(min + 0.1);
      return setPlaybackPos(min);
    }
    if (max != null && playbackPos >= max && !hasEnded) {
      setIsPaused(true);
      setHasEnded(true);
      updatePlaybackPosRange(max);
      return setPlaybackPos(max);
    }
    if (playbackPos >= 0 && max != null && !(playbackPos >= max)) setHasEnded(false);

    setPlaybackPos((event.target as HTMLAudioElement).currentTime * accuracyConstant);
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

  function updateSelectionRangePos(time: number) {
    // playbackTime * duration / (-maxDuration + duration)

    const barTime = (time * duration / (-songMaxPlayDurationSeconds + duration)); // George Zeng was here - SPH3U1 10/2/2023

    setSelectionRange?.(time / accuracyConstant);
    setDisplaySelectionRange(Math.min(Math.max(0, time), duration - songMaxPlayDurationSeconds));
    rangeRef.current!.valueAsNumber = barTime;
  }

  useEffect(() => {
    if (songPreview == null) return;
    if (audioElemRef.current) {
      if (min != null && max != null && playbackPos >= max) {
        if (!isPaused) {
          updatePlaybackPosRange(min + 1);
          setPlaybackPos(min);
          audioElemRef.current.play();
          return;
        }
      }
      isPaused ? audioElemRef.current.pause() : audioElemRef.current.play();
    }
  }, [isPaused]);

  useEffect(() => {
    if (songPreview == null) return;
    setBuffered(0);
    setPlaybackPos(0);
    setDisplaySelectionRange(0);
    setDuration(0);
  }, [songPreview]);

  useEffect(() => {
    const handler = () => {
      if (songPreview == null) return;
      setDuration(audioElemRef.current ? audioElemRef.current.duration * accuracyConstant : 0);

      audioElemRef
        .current!.play()
        .then(() => setIsPaused(false))
        .catch(() => {
          setIsAwaiting(true);
          setIsPaused(true);
        });
    };
    if (audioElemRef.current) {
      audioElemRef.current.addEventListener("loadedmetadata", handler);
    }

    const updateBufferPercent = setInterval(() => {
      if (!audioElemRef.current) return;

      const buffer = audioElemRef.current.buffered;
      let duration = audioElemRef.current.duration;

      if (isNaN(duration)) return;

      if (min != null && max != null) duration = (max - min) / accuracyConstant;

      setBuffered(buffer.end(buffer.length - 1) / duration);
    }, 250);

    return () => {
      clearInterval(updateBufferPercent);
      audioElemRef?.current?.removeEventListener("loadedmetadata", handler);
    };
  }, [songPreview, audioElemRef]);

  return (
    <div className={styles["requests__play-range"]}>
      {songPreview && (
        <div className={`${styles.requests__loading} ${buffered > 0 || isAwaiting ? styles["requests__loading--done"] : ""}`}>
          <img src="/images/loading3.svg" alt="Loading" className={styles["requests__loading-image"]} />
        </div>
      )}

      <audio
        src={songPreview?.url || ""}
        onTimeUpdate={updatePlaybackPos}
        onEnded={() => {
          setIsPaused(true);
          setHasEnded(true);
        }}
        ref={audioElemRef}
        volume={volume}
      >
        <source src={songPreview?.url || ""} type={songPreview?.mime_type || ""} />
      </audio>

      <label htmlFor="range" style="position: absolute; opacity: 0; pointer-events: none; width: 1px; height: 1px;">
        Scrub playback
      </label>
      <label htmlFor="track-scrubber" style="position: absolute; opacity: 0; pointer-events: none;width: 1px; height: 1px;">
        Change play range
      </label>

      <input
        type="range"
        name="track-scrubber"
        id="track-scrubber"
        className={`${styles["requests__play-range-input"]} ${styles["requests__play-range-input--scrubber"]}`}
        value={playbackPos}
        onChange={updatePlaybackPosRange}
        min={min || 0}
        max={max || duration}
      />
      <input
        type="range"
        name="range"
        id="range"
        className={`${styles["requests__play-range-input"]} ${styles["requests__play-range-input--duration"]} ${
          playbackPos >= selectionDisplayRange && playbackPos <= selectionDisplayRange + songMaxPlayDurationSeconds
            ? styles["requests__play-range-input--duration--active"]
            : ""
        }`}
        min={min || 0}
        max={max || duration}
        disabled={!editable}
        ref={rangeRef}
        onChange={(e) => {
          if (!editable) return e.preventDefault();
          const currentSel = (e.target as HTMLInputElement).valueAsNumber;

          const displayRange = Math.round((currentSel - (currentSel / duration) * songMaxPlayDurationSeconds) * 100) / 100;
          setDisplaySelectionRange(displayRange);
          setSelectionRange?.(displayRange / accuracyConstant);
        }}
        style={`--thumb-width: ${Math.min((songMaxPlayDurationSeconds / duration) * 100, 100)}%; --buffer-percentage: ${buffered}`}
      />

      <div className={`${styles["requests__play-controller"]} ${styles["requests__play-btns"]}`}>
        <div className={styles["requests__play-btns-group"]}>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            title="Toggle playback"
            onClick={() => setIsPaused((isPaused) => (isPaused ? false : true))}
          >
            <i class={"fa-regular fa-" + (isPaused ? (hasEnded ? "rotate-left" : "play") : "pause")}></i>
          </button>
        </div>
        <div className={styles["requests__play-btns-group"]}>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updatePlaybackPosRange(selectionDisplayRange)}
            title="Jump to start of selected range"
          >
            <i class="fa-light fa-arrow-left-to-line"></i>
          </button>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updatePlaybackPosRange(selectionDisplayRange + songMaxPlayDurationSeconds)}
            title="Jump to end of selected range"
          >
            <i class="fa-light fa-arrow-right-to-line"></i>
          </button>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updateSelectionRangePos(playbackPos)}
            title="Set start of playhead to selected range"
          >
            <i class="fa-light fa-arrow-left-from-line"></i>
          </button>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updateSelectionRangePos(playbackPos - songMaxPlayDurationSeconds)}
            title="Set end of playhead to selected range"
          >
            <i class="fa-light fa-arrow-right-from-line"></i>
          </button>
        </div>
      </div>
      <div className={`${styles["requests__play-controller"]} ${styles["requests__play-volume"]}`}>
        <i className="fa-regular fa-volume"></i>
        <label htmlFor="volume">Volume</label>
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
          {secondsToHumanReadableString(playbackPos / accuracyConstant)} / {secondsToHumanReadableString(duration / accuracyConstant)}
        </p>
        <p className={styles["requests__play-text"]}>
          Selection range: {secondsToHumanReadableString(selectionDisplayRange / accuracyConstant)}-
          {secondsToHumanReadableString((selectionDisplayRange + songMaxPlayDurationSeconds) / accuracyConstant)}
        </p>
      </div>
    </div>
  );
}
