import { useEffect, useState } from "preact/hooks";
import { Request } from "../../types";
import styles from "./MyRequests.module.css";

import * as config from "../../shared/config.json";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  weekday: "short",
});

export function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    (async () => {
      const requests = await fetch("/api/requests/me");

      if (requests.ok) {
        setRequests((await requests.json()) as Request[]);
      } else {
        alert(`Failed to get your requests, error code ${requests.status}`);
      }
    })();
  }, []);

  async function cancelRequest(request: Request) {
    if (!confirm(`Are you sure you want to cancel your request for: ${request.track.title} - ${request.track.artist}?`)) return;

    const requestId = request._id;

    const cancel = await fetch("/api/requests/" + requestId, {
      method: "DELETE",
    });

    if (cancel.ok) {
      setRequests((requests) => requests.filter((request) => request._id !== requestId));

      alert(`Cancelled request for: ${request.track.title} - ${request.track.artist}`);
    } else {
      alert(`Failed to cancel request, error ${cancel.status}`);
    }
  }

  return (
    <main className={styles.myrequests}>
      <header className={styles.myrequests__header}>
        <h1 className={styles.myrequests__heading}>Your Requests</h1>
        <p className={styles.myrequests__subtitle}>
          You have used {requests.length} of max {config.maxSongsPerCycle} requests this cycle.
        </p>
      </header>
      <ul className={styles.myrequests__list}>
        {requests.length === 0 ? (
          <li className={styles.myrequests__info}>You have no requests yet.</li>
        ) : (
          requests
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((request) => (
              <li className={styles.myrequests__item}>
                <div className={styles["myrequests__item-image"]}>
                  <img
                    src={request?.track?.cover}
                    alt={request?.track?.title || "[Awaiting]" + "'s thumbnail"}
                    referrerpolicy="no-referrer"
                    className={styles["myrequests__item-img"]}
                  />
                </div>
                <div className={styles["myrequests__item-content"]}>
                  {/* Request cancelling code, cannot be implemented yet */}
                  {/* <div className={styles["myrequests__item-options"]}>
                    <button className={styles["myrequests__item-cancel"]}>
                      <i class="fa-regular fa-ellipsis-vertical"></i>
                    </button>
                    <ul className={styles["myrequests__item-options-list"]}>
                      {request.status !== "ACCEPTED" && (
                        <li className={styles["myrequests__item-options-item"]}>
                          <button onClick={() => cancelRequest(request)}>Cancel request</button>
                        </li>
                      )}
                    </ul>
                  </div> */}
                  <div className={styles["myrequests__item-info"]}>
                    <p>{request?.track?.title || "[Awaiting]"}</p>
                    <p>
                      {request?.track?.artist ||
                        ("Spotify " && (
                          <a href={"https://open.spotify.com/track/" + request.spotifyId} target="_blank" rel="noopener noreferrer">
                            Track Link
                          </a>
                        ))}
                    </p>
                    <p>Requested on {dateFormatter.format(new Date(request.createdAt))}</p>
                  </div>
                  <div className={styles["myrequests__item-status"]}>
                    {request.status.toLowerCase().replace(/_/g, " ")}{" "}
                    <a href="/help#statuses" title="See elaboration">
                      <i class="fa-solid fa-circle-question"></i>
                    </a>
                  </div>
                </div>
              </li>
            ))
        )}
      </ul>
    </main>
  );
}
