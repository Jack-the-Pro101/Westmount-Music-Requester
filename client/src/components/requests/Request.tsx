import styles from "../../routes/requests/Requests.module.css";
import { Request } from "../../types";

export function Request({ request }: { request: Request }) {
  return (
    <li className={styles["requests__item"]}>
      <div className={styles["requests__item-col"]}>{request.spotifyId}</div>
      <div className={styles["requests__item-col"]}></div>
      <div className={styles["requests__item-col"]}></div>
    </li>
  );
}
