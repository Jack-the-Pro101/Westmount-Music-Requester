import { useEffect, useState } from "preact/hooks";
import styles from "./Requests.module.css";

import { Request } from "../../types";
import { Request as RequestElement } from "../../components/requests/Request";

import io from "socket.io-client";

export function Requests() {
  const [requests, setRequests] = useState<Request[]>([]);

  const [socketConnected, setSocketConnected] = useState(false);
  const [socketLastPong, setSocketLastPong] = useState<Date | null>(null);

  const [filterQuery, setFilterQuery] = useState("");

  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

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
    return strings.some((string) => string.toLowerCase().includes(filter.toLowerCase()));
  }

  return (
    <main class={styles.requests}>
      <form action="#" className={styles.requests__filter}>
        <fieldset className={styles.requests__fieldset}>
          <label htmlFor="filter">Search</label>
          <input type="text" name="filter" id="filter" onChange={(e: Event) => setFilterQuery(e.target!.value)} />
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
      </form>
      <ol className={styles.requests__list}>
        {requests
          .filter((request) => anyStringIncludes([request.track.title, request.track.artist, request.user.name], filterQuery))
          .map((request) => (
            <RequestElement request={request} key={request._id} />
          ))}
      </ol>
      <p>{socketConnected}</p>
      <p>{socketLastPong?.getDate()}</p>
      <p></p>
    </main>
  );
}
