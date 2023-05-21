import { TargetedEvent } from "preact/compat";
import { StateUpdater, useEffect, useRef, useState } from "preact/hooks";
import { TrackSourceInfo } from "../../types";
import styles from "./Requests.module.css";

import * as config from "../../shared/config.json";
import { secondsToHumanReadableString } from "../../utils";

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
  const accuracyConstant = 2;
  const songMaxPlayDurationSeconds = config.songMaxPlayDurationSeconds * accuracyConstant;

  if (min) min *= accuracyConstant;
  if (max) max *= accuracyConstant;

  const [playbackPos, setPlaybackPos] = useState(0);
  const storedVolume = localStorage.getItem("volume") ? parseFloat(localStorage.getItem("volume") as string) : 1;
  const [volume, setVolume] = useState(Number.isNaN(storedVolume) ? 1 : storedVolume);
  const [isPlaying, setIsPlaying] = useState(false);
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
      updatePlaybackPosRange(min + 1);
      return setPlaybackPos(min);
    }
    if (max != null && playbackPos >= max) {
      setIsPlaying(true);
      updatePlaybackPosRange(max + 1);
      return setPlaybackPos(max);
    }
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

  function updateSelctionRangePos(time: number) {
    // if (rangeRef) rangeRef.current!.value = (time + (time / duration) * songMaxPlayDurationSeconds * (-0.0029 * duration + 2.3)).toString();
    // C = AB - A

    setSelectionRange?.(selectionRange * (songMaxPlayDurationSeconds / duration) - selectionRange);
  }

  useEffect(() => {
    if (songPreview == null) return;
    if (audioElemRef.current) {
      if (min != null && max != null && playbackPos >= max) {
        if (!isPlaying) {
          updatePlaybackPosRange(min + 1);
          setPlaybackPos(min);
          audioElemRef.current.play();
          return;
        }
      }
      isPlaying ? audioElemRef.current.pause() : audioElemRef.current.play();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (songPreview == null) return;
    setBuffered(0);
    setPlaybackPos(0);
    setDuration(0);
    if (audioElemRef.current) isPlaying ? audioElemRef.current.pause() : audioElemRef.current.play();
  }, [songPreview]);

  useEffect(() => {
    const handler = () => {
      if (songPreview == null) return;
      setDuration(audioElemRef.current ? audioElemRef.current.duration * accuracyConstant : 0);
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
        <div className={`${styles.requests__loading} ${buffered > 0 ? styles["requests__loading--done"] : ""}`}>
          <img src="/images/loading3.svg" alt="Loading" className={styles["requests__loading-image"]} />
        </div>
      )}

      {songPreview && (
        <audio
          src={songPreview.url}
          onTimeUpdate={updatePlaybackPos}
          onEnded={() => setIsPlaying(true)}
          ref={audioElemRef}
          volume={volume}
        >
          <source src={songPreview.url} type={songPreview.mime_type} />
        </audio>
      )}

      <label htmlFor="range" style="position: absolute; opacity: 0; pointer-events: none; width: 1px; height: 1px;">
        Scrub playback
      </label>
      <label
        htmlFor="track-scrubber"
        style="position: absolute; opacity: 0; pointer-events: none;width: 1px; height: 1px;"
      >
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
          const currentSel = Number((e.target as HTMLInputElement).value);

          const displayRange =
            Math.round((currentSel - (currentSel / duration) * songMaxPlayDurationSeconds) * 100) / 100;
          setDisplaySelectionRange(displayRange);
          setSelectionRange?.(displayRange / accuracyConstant);
        }}
        style={`--thumb-width: ${Math.min(
          (songMaxPlayDurationSeconds / duration) * 100,
          100
        )}%; --buffer-percentage: ${buffered}`}
      />

      <div className={`${styles["requests__play-controller"]} ${styles["requests__play-btns"]}`}>
        <div className={styles["requests__play-btns-group"]}>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            title="Toggle playback"
            onClick={() => setIsPlaying((isPlaying) => (isPlaying ? false : true))}
          >
            <i class={"fa-regular fa-" + (isPlaying ? "play" : "pause")}></i>
          </button>
        </div>
        <div className={styles["requests__play-btns-group"]}>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updatePlaybackPosRange(selectionDisplayRange)}
            title="Jump to start of selected range"
          >
            <i class="fa-light fa-arrow-left-long-to-line"></i>
          </button>
          <button
            type="button"
            className={styles["requests__play-btn"]}
            onClick={() => updatePlaybackPosRange(selectionDisplayRange + songMaxPlayDurationSeconds)}
            title="Jump to end of selected range"
          >
            <i class="fa-light fa-arrow-right-long-to-line"></i>
          </button>
          {/* <button
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
          </button> */}
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
          {secondsToHumanReadableString(playbackPos / accuracyConstant)} /{" "}
          {secondsToHumanReadableString(duration / accuracyConstant)}
        </p>
        <p className={styles["requests__play-text"]}>
          Selection range: {secondsToHumanReadableString(selectionDisplayRange / accuracyConstant)}-
          {secondsToHumanReadableString((selectionDisplayRange + songMaxPlayDurationSeconds) / accuracyConstant)}
        </p>
      </div>
    </div>
  );
}
