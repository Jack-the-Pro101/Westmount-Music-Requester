import styles from "./Login.module.css";
import "./Login.module.css";

import { getProviders, getSession, useSession, signIn } from "next-auth/react";
import Head from "next/head";

export default function Login({ providers }) {
  return (
    <main className={styles.login}>
      <Head>
        <title>Log in to account</title>
      </Head>

      <div className={styles.login__panel}>
        <h1 className={styles.login__heading}>Log in</h1>
        <ul className={styles.login__list}>
          {Object.values(providers).map((provider) => (
            <li className={styles.login__item} key={provider.name}>
              <button className={styles.login__btn} onClick={() => signIn(provider.id)}>
                Sign in with {provider.name}
              </button>
            </li>
          ))}
        </ul>
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
