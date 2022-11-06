import { getProviders, getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useMemo } from "react";
import styles from "./Error.module.css";

interface ErrorInfo {
  errorTitle: string;
  errorMsg: string;
}

export default function Error() {
  const { query } = useRouter();

  function computeErrorMsg() {
    let errorTitle: string;
    let errorMsg: string;

    switch (query?.error) {
      case "AccessDenied":
        errorTitle = "Access Denied";
        errorMsg = "You must use an HWDSB email account (@hwdsb.on.ca) in order to sign in.";
        break;

      case "Configuration":
        errorTitle = "Configuration Error";
        errorMsg = "THIS IS NOT THE FAULT OF YOU! A server-side configuration issue has occured. Please inform relevant figures of this to resolve the issue.";
        break;
      case "Verification":
        errorTitle = "Verification Error";
        errorMsg = "Email token has expired or has already been used.";
        break;
      case "Default":
        errorTitle = "Unknown Error";
        errorMsg = "._.";
        break;

      default:
        errorTitle = "Unknown Error";
        errorMsg = "._.";
        break;
    }

    return {
      errorTitle,
      errorMsg,
    };
  }

  const errorInfo = useMemo(() => computeErrorMsg(), [query?.error]);

  return (
    <main className={styles.error}>
      <div className={styles.error__panel}>
        <h1 className={styles.error__title}>{errorInfo.errorTitle}</h1>

        <p className={styles.error__msg}>{errorInfo.errorMsg}</p>

        <button className={styles.error__login} onClick={() => signIn()}>
          Back to login
        </button>
      </div>
    </main>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const providers = await getProviders();
  return {
    props: { providers },
  };
}
