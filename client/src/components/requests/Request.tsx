import { useState } from "preact/hooks";
import styles from "../../routes/requests/Requests.module.css";
import { Request as RequestType } from "../../types";

export function Request({ request }: { request: RequestType }) {
  const [isActive, setIsActive] = useState(false);

  return (
    <li className={styles["requests__item"]}>
      <button className={styles["requests__btn"]} onClick={() => setIsActive(!isActive)}>
        <div className={styles["requests__item-col"]}>
          {request.track.title} - {request.track.artist}
        </div>
        <div className={styles["requests__item-col"]}>
          <p>{request.user.name}</p>
        </div>
        <div className={styles["requests__item-col"]}></div>
      </button>
      <div className={styles["requests__popup"] + (isActive ? " " + styles["requests__popup--active"] : "")}>
        <div className={styles["requests__popup-box"]}>
          <h3 className={styles["requests__popup-heading"]}>{request.track.title}</h3>
        </div>
      </div>
    </li>
  );
}
