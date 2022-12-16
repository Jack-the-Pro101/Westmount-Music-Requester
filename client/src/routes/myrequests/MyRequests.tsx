import { useEffect, useState } from "preact/hooks";
import { Request } from "../../types";
import styles from "./MyRequests.module.css";

export function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    (async () => {
      const requests = await fetch("/api/requests/me");

      if (requests.ok) {
        setRequests((await requests.json()) as Request[]);
      }
    })();
  }, []);

  return (
    <main className={styles.myrequests}>
      <header className={styles.myrequests__header}>
        <h1 className={styles.myrequests__heading}>Your Requests</h1>
      </header>
      <ul className={styles.myrequests__list}>
        {requests.map((request) => (
          <li className={styles.myrequests__item}>
            <div className={styles["myrequests__item-image"]}>
              <img
                src={request?.track.cover}
                alt={request.track.title + "'s thumbnail"}
                referrerpolicy="no-referrer"
                className={styles["myrequests__item-img"]}
              />
            </div>
            <div className={styles["myrequests__item-content"]}>
              <div className={styles["myrequests__item-info"]}>
                <p>{request.track.title}</p>
                <p>{request.track.artist}</p>
                <p>
                  Requested on{" "}
                  {new Intl.DateTimeFormat(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  }).format(new Date(request.createdAt))}
                </p>
              </div>
              <div className={styles["myrequests__item-status"]}>
                {request.status.toLowerCase().replace(/_/g, " ")}{" "}
                <a href="/help#statuses" title="See elaboration">
                  <i class="fa-solid fa-circle-question"></i>
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
