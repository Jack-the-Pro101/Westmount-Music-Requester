import { useState } from "preact/hooks";
import styles from "../../routes/requests/Requests.module.css";
import { Request as RequestType } from "../../types";

export function Request({ request, setActive }: { request: RequestType; setActive: any }) {
  return (
    <li className={styles["requests__item"]}>
      <button className={styles["requests__btn"]} onClick={() => setActive(request)}>
        <div className={styles["requests__item-col"]}>
          <p>{request.track.title}</p>
          <p style="color: hsl(var(--clr-neutral-700))">{request.track.artist}</p>
        </div>
        <div className={styles["requests__item-col"]}>
          <p>{request.user.name}</p>
        </div>
        <div className={styles["requests__item-col"]}>
          <p style="color: hsl(var(--clr-neutral-700));">
            Requested{" "}
            {new Intl.DateTimeFormat(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              weekday: "short",
            }).format(new Date(request.createdAt))}
          </p>
        </div>
      </button>
    </li>
  );
}
