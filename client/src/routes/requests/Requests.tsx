import { useEffect, useState } from "preact/hooks";
import styles from "./Requests.module.css";

import { Request } from "../../types";
import { Request as RequestElement } from "../../components/requests/Request";

export function Requests() {
  const [requests, setRequests] = useState<Request[]>([]);

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

  return (
    <main class={styles.requests}>
      <ol className={styles.requests__list}>
        {requests.map((request) => (
          <RequestElement request={request} />
        ))}
      </ol>
    </main>
  );
}
