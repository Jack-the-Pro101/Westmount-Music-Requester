import { useSearchParams } from "react-router-dom";
import styles from "./Error.module.css";

export function Error() {
  let errorTitle;
  let errorMsg;

  const [searchParams] = useSearchParams();
  const errorType = searchParams.get("code");

  switch (errorType) {
    case "auth":
      errorTitle = "Invalid Email";
      errorMsg = "You attempted to login using a non-school email. Please retry with the appropriate email (ending in @hwdsb.on.ca)";
      break;
    default:
      if (errorType == null) {
        errorTitle = "404 Not Found";
        errorMsg = "The page you are trying to access does not exist.";
      } else {
        errorTitle = "Unexpected Error";
        errorMsg = "An unexpected error has occured. Apologies for any inconveiences.";
      }
  }

  return (
    <main className={styles.error}>
      <header className={styles.error__header}>
        <h1 className={styles.error__title}>{errorTitle}</h1>
        <p className={styles.error__msg}>{errorMsg}</p>
      </header>
    </main>
  );
}
