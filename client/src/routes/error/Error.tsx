import styles from "./Error.module.css";

export function Error({ errorType, CustomRender }: { errorType: string | null; CustomRender: any }) {
  let errorTitle;
  let errorMsg;

  switch (errorType) {
    case "":
      break;
    default:
      errorTitle = "Unexpected Error";
      errorMsg = "An unexpected error has occured. Apologies for any inconveiences.";
  }

  return (
    <main className={styles.error}>
      <header className={styles.error__header}>
        <h1 className={styles.error__title}>{errorTitle}</h1>
        <p className={styles.error__msg}>{errorMsg}</p>
      </header>
      {CustomRender && <CustomRender />}
    </main>
  );
}
