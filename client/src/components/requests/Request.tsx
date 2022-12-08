import styles from "../../routes/requests/Requests.module.css";
import { Request as RequestType } from "../../types";

export function Request({ request }: { request: RequestType }) {
  return (
    <li className={styles["requests__item"]}>
      <div className={styles["requests__item-col"]}>
        {request.track.title} - {request.track.artist}
      </div>
      <div className={styles["requests__item-col"]}>
        <p>{request.user.name}</p>
      </div>
      <div className={styles["requests__item-col"]}>Buttons</div>
    </li>
  );
}
