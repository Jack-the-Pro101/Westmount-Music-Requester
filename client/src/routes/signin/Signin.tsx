import { useState } from "preact/hooks";
import styles from "./Signin.module.css";

export function Signin() {
  const [adminSigninShown, setAdminSigninShown] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignin(e: Event) {
    e.preventDefault();

    const request = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
  }

  return (
    <main className={styles.signin}>
      <form action="#" className={styles.signin__form} onSubmit={handleSignin}>
        <h1 className={styles.signin__heading}>Sign In</h1>

        <fieldset className={styles.signin__fieldset}>
          <a href="/api/auth">
            <button className={styles["signin__option-btn"]} type="button">
              Sign in with Google
            </button>
          </a>
        </fieldset>
        <p className={styles.signin__description}>Use your HWDSB account and sign in with Google.</p>

        <fieldset className={styles.signin__fieldset}>
          <label htmlFor="is-admin">Admin login?</label>
          <input type="checkbox" name="is-admin" id="is-admin" onChange={() => setAdminSigninShown(!adminSigninShown)} checked={adminSigninShown} />
        </fieldset>

        <fieldset className={styles.signin__fieldset + ` ${adminSigninShown ? "" : styles.hidden}`}>
          <h2 className={styles.signin__subheading}>Admin Sign In</h2>

          <label htmlFor="username">Username</label>
          <input type="text" name="username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button type="submit">Sign In</button>
        </fieldset>
      </form>
    </main>
  );
}
