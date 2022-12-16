import { useEffect, useState } from "preact/hooks";
import styles from "./Requests.module.css";

import { Request, RequestPage, TrackSourceInfo } from "../../types";
import { Request as RequestElement } from "../../components/requests/Request";

import { PlayRange } from "../../components/requests/PlayRange";

import * as config from "../../shared/config.json";

import io from "socket.io-client";
import { Link } from "react-router-dom";

export function Requests() {
  const [requests, setRequests] = useState<Request[]>([]);

  const [socketConnected, setSocketConnected] = useState(false);
  const [socketLastPong, setSocketLastPong] = useState<Date | null>(null);

  const [selectedTrackSource, setSelectedTrackSource] = useState<TrackSourceInfo>();

  const [filterQuery, setFilterQuery] = useState("");

  const [sortBy, setSortBy] = useState("popular");
  const [sortFilter, setSortFilter] = useState("none");

  const addedTracks: string[] = [];

  function validateTrackShouldAdd(trackId: string) {
    if (addedTracks.includes(trackId)) {
      return false;
    }
    addedTracks.push(trackId);
    return true;
  }

  const requestPages = {} as RequestPage;

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

  const [selectedTrack, setSelectedTrack] = useState<Request | null>(null);

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
    const submission = await fetch("/api/requests/" + request.track._id, {
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

  function sortFunction(a: Request, b: Request) {
    switch (sortBy.toLowerCase()) {
      case "popular":
        return b.popularity - a.popularity;

      case "unpopular":
        return a.popularity - b.popularity;

      case "new":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      case "old":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  }

  return (
    <main class={styles.requests}>
      <h1 className={styles.requests__heading}>Requests</h1>
      <form action="#" className={styles.requests__filter}>
        <fieldset className={styles.requests__fieldset}>
          <label htmlFor="filter">Search</label>
          <input type="text" name="filter" id="filter" value={filterQuery} onChange={(e: Event) => setFilterQuery(e.target!.value)} />
        </fieldset>
        <fieldset className={styles.requests__fieldset}>
          <label htmlFor="sort">Sort By</label>
          <select name="sort" id="sort" onChange={(e: Event) => setSortBy(e.target!.value)}>
            <option value="popular">Most Requested</option>
            <option value="unpopular">Least Requested</option>
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
          </select>
        </fieldset>
        <fieldset className={styles.requests__fieldset}>
          <label htmlFor="type-sort">Filter By Type</label>
          <select name="type-sort" id="type-sort" onChange={(e: Event) => setSortFilter(e.target!.value)}>
            <option value="none">No Filter</option>
            <option value="pending">Pending</option>
            <option value="pending_manual">Pending Manual</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
            <option value="auto_rejected">Auto Rejected</option>
          </select>
        </fieldset>
      </form>
      <ol className={styles.requests__list}>
        {requests
          .sort(sortFunction)
          .map((request) => {
            // @ts-expect-error
            const value = requestPages[request.track._id];
            if (value == null) {
              // @ts-expect-error
              requestPages[request.track._id] = [request._id];
            } else {
              // @ts-expect-error
              requestPages[request.track._id].push(request._id);
            }

            return request;
          })
          .filter(
            (request) =>
              validateTrackShouldAdd(request.track._id) &&
              (sortFilter === "none" || (request.status === sortFilter.toUpperCase() && request.track)) &&
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
          .map((request, i, array) =>
            array.length === 0 ? (
              <li className={styles["requests__list-label"]}>No requests.</li>
            ) : (
              <RequestElement request={request} key={request._id} setActive={setSelectedTrack} />
            )
          )}
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
                    setSelectedTrack(null);
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
                  <li className={styles["requests__popup-item"]}>
                    Popularity:{" "}
                    {
                      // @ts-expect-error
                      requestPages[selectedTrack.track._id].length
                    }{" "}
                    person(s)
                  </li>
                  {selectedTrack.status === "PENDING_MANUAL" && (
                    <li className={styles["requests__popup-item"]} style="margin-top: 0.25em; color: hsl(var(--clr-neutral-700))">
                      <i class="fa-regular fa-circle-exclamation" style="margin-right: 0.5em"></i>
                      This track may be an instrumental or contains unknown lyrics. View Spotify page and listen to track to check lyrics.
                    </li>
                  )}
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
                  setSelectionRange={null}
                  editable={false}
                />
              </div>
              <div className={styles["requests__popup-footer"]}>
                <button
                  className={styles["requests__popup-footer-btn"] + " " + styles["requests__popup-reject-btn"]}
                  onClick={() => {
                    setSelectedTrackSource(undefined);
                    setSelectedTrack(null);
                    submitRequest(selectedTrack, false);
                  }}
                >
                  Reject
                </button>
                <button
                  className={styles["requests__popup-footer-btn"] + " " + styles["requests__popup-accent-btn"]}
                  onClick={() => {
                    setSelectedTrackSource(undefined);
                    setSelectedTrack(null);
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
