import { useEffect, useState } from "preact/hooks";
import styles from "./Requests.module.css";

import { Request, TrackSourceInfo } from "../../types";
import { Request as RequestElement } from "../../components/requests/Request";

import { PlayRange } from "../../components/requests/PlayRange";

import * as config from "../../shared/config.json";

import io from "socket.io-client";

export function Requests() {
  const [requests, setRequests] = useState<Request[]>([]);

  const [socketConnected, setSocketConnected] = useState(false);
  const [socketLastPong, setSocketLastPong] = useState<Date | null>(null);

  const [selectedTrackSource, setSelectedTrackSource] = useState<TrackSourceInfo>();

  const [filterQuery, setFilterQuery] = useState("");

  // const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

  // useEffect(() => {
  //   const socketIo = io.connect("/api/requests");

  //   setSocket(socketIo);

  //   socket?.on("connect", () => {
  //     setSocketConnected(true);
  //   });

  //   socket?.on("disconnect", () => {
  //     setSocketConnected(false);
  //   });

  //   socket?.on("pong", () => {
  //     setSocketLastPong(new Date());
  //   });

  //   return () => {
  //     socket?.off("connect");
  //     socket?.off("disconnect");
  //     socket?.off("pong");
  //   };
  // }, []);

  // function pingSocket() {
  //   socket?.emit("ping");
  // }

  useEffect(() => {
    (async () => {
      const request = await fetch("/api/requests");

      if (request.ok) {
        setRequests((await request.json()) as Request[]);
      } else {
        alert("Failed to get requests");
      }
    })();
  }, []);

  function anyStringIncludes(strings: string[], filter: string) {
    if (!filter) return true;
    return strings.some((string) => string.replace(/ /g, "").toLowerCase().includes(filter.toLowerCase().replace(/ /g, "")));
  }

  const [selectedTrack, setSelectedTrack] = useState<Request>();

  useEffect(() => {
    (async () => {
      if (!selectedTrack || !selectedTrack.track) return;

      const aborter = new AbortController();

      (async () => {
        const request = await fetch("/api/music/source?id=" + selectedTrack.track.youtubeId, {
          signal: aborter.signal,
        });

        if (request.ok) {
          setSelectedTrackSource(await request.json());
        }
      })();

      return () => aborter.abort();
    })();
  }, [selectedTrack]);

  async function submitRequest(request: Request, accepted: boolean) {
    const submission = await fetch("/api/requests/" + request._id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        evaluation: accepted,
      }),
    });

    if (submission.ok) {
      alert("OK");
    } else {
      alert("FAIL");
    }
  }

  return (
    <main class={styles.requests}>
      <form action="#" className={styles.requests__filter}>
        <fieldset className={styles.requests__fieldset}>
          <label htmlFor="filter">Search</label>
          <input type="text" name="filter" id="filter" value={filterQuery} onChange={(e: Event) => setFilterQuery((e.target as HTMLInputElement).value)} />
        </fieldset>
        <fieldset className={styles.requests__fieldset}>
          <label htmlFor="sort">Sort By</label>
          <select name="sort" id="sort">
            <option value="popular">Most Requested</option>
            <option value="unpopular">Least Requested</option>
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
          </select>
        </fieldset>
        <fieldset className={styles.requests__fieldset}>
          <label htmlFor="type-sort">Sort By Type</label>
          <select name="type-sort" id="type-sort">
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
            <option value="autorejected">Auto Rejected</option>
          </select>
        </fieldset>
      </form>
      <ol className={styles.requests__list}>
        {requests
          .filter(
            (request) =>
              request.track &&
              anyStringIncludes(
                [
                  request.track.title,
                  request.track.artist,
                  request.user.name,
                  request.track.title + request.track.artist,
                  request.track.title + request.track.artist + request.user.name,
                ],
                filterQuery
              )
          )
          .map((request) => (
            <RequestElement request={request} key={request._id} setActive={setSelectedTrack} />
          ))}
      </ol>

      <div className={styles["requests__popup"] + (selectedTrack ? " " + styles["requests__popup--active"] : "")}>
        <div className={styles["requests__popup-box"]}>
          {selectedTrack && (
            <>
              <div className={styles["requests__popup-header"]}>
                <h3 className={styles["requests__popup-heading"]}>{selectedTrack.track.title}</h3>
                <p className={styles["requests__popup-subtitle"]}>{selectedTrack.track.artist}</p>

                <button
                  className={styles["requests__popup-close-btn"]}
                  onClick={() => {
                    setSelectedTrackSource(undefined);
                    setSelectedTrack(undefined);
                  }}
                >
                  <i class="fa-regular fa-xmark"></i>
                </button>
              </div>
              <div className={styles["requests__popup-content"]}>
                <ul className={styles["requests__popup-list"]}>
                  <li className={styles["requests__popup-item"]}>
                    Requested by: {selectedTrack.user.name} ({selectedTrack.user?.email || "Internal account"})
                  </li>
                  <li className={styles["requests__popup-item"]}>Status: {selectedTrack.status}</li>
                </ul>

                <div className={styles["requests__popup-spotify"]} href={"https://open.spotify.com/track/" + selectedTrack.spotifyId}>
                  <div className={styles["requests__popup-spotify-image"]}>
                    <img
                      src={selectedTrack.track.cover}
                      alt={`${selectedTrack.track.title}'s cover`}
                      referrerpolicy="no-referrer"
                      className={styles["requests__popup-spotify-img"]}
                    />
                  </div>

                  <a
                    className={styles["requests__popup-spotify-link"]}
                    href={"https://open.spotify.com/track/" + selectedTrack.spotifyId}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button>
                      Spotify <i class="fa-regular fa-arrow-up-right-from-square"></i>
                    </button>
                  </a>
                </div>

                <PlayRange
                  min={selectedTrack.start}
                  max={selectedTrack.start + config.songMaxPlayDurationSeconds}
                  songPreview={selectedTrackSource}
                  selectionRange={selectedTrack.start}
                  editable={false}
                />
              </div>
              <div className={styles["requests__popup-footer"]}>
                <button
                  className={styles["requests__popup-footer-btn"] + " " + styles["requests__popup-reject-btn"]}
                  onClick={() => {
                    setSelectedTrackSource(undefined);
                    setSelectedTrack(undefined);
                    submitRequest(selectedTrack, false);
                  }}
                >
                  Reject
                </button>
                <button
                  className={styles["requests__popup-footer-btn"] + " " + styles["requests__popup-accent-btn"]}
                  onClick={() => {
                    setSelectedTrackSource(undefined);
                    setSelectedTrack(undefined);
                    submitRequest(selectedTrack, true);
                  }}
                >
                  Accept
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <p>{socketConnected}</p>
      <p>{socketLastPong?.getDate()}</p>
      <p></p>
    </main>
  );
}
