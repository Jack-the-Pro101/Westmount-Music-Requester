import { useContext, useEffect, useState } from "preact/hooks";
import { AuthContext } from "../../app";
import { BASE_URL } from "../../env";
import styles from "./SignIn.module.css";

export function SignIn() {
  const { login, user } = useContext(AuthContext);

  const [adminSigninShown, setAdminSigninShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCount, setErrorCount] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user != null) {
      window.location.href = "/";
    }
  }, [user]);

  async function handleSignin(e: Event) {
    e.preventDefault();

    setLoading(true);
    const user = await login(username, password);
    setLoading(false);

    if (user) {
      window.location.replace("/");
    } else {
      setErrorMsg(`Username or password invalid. ${errorCount > 0 ? `(${errorCount})` : ""}`);
      setErrorCount((count) => count + 1);
    }
  }

  useEffect(() => {
    const removeError = setTimeout(() => {
      setErrorMsg("");
    }, 5000);

    return () => clearTimeout(removeError);
  }, [errorCount]);

  return (
    <main className={styles.signin}>
      <form action="#" className={styles.signin__form} onSubmit={handleSignin}>
        <h1 className={styles.signin__heading}>Sign In</h1>

        <fieldset className={styles.signin__fieldset}>
          <a href={BASE_URL + "/api/auth"} tabIndex={-1}>
            <button className={styles["signin__option-btn"]} type="button">
              Sign in with Google
            </button>
          </a>
        </fieldset>
        <p className={styles.signin__description}>Use your HWDSB account to sign in with Google.</p>

        <div style="display: flex; flex-direction: column">
          <fieldset className={styles.signin__fieldset} style="order: 2">
            <div className={styles["signin__fieldset-section"]} style={{ marginBottom: 0 }}>
              <label htmlFor="is-admin">Admin sign in?</label>
              <input type="checkbox" name="is-admin" id="is-admin" onChange={() => setAdminSigninShown(!adminSigninShown)} checked={adminSigninShown} />
            </div>
          </fieldset>
          <fieldset className={styles.signin__fieldset + ` ${adminSigninShown ? "" : styles.hidden}`} style="order: 1">
            <hr />

            <h2 className={styles.signin__subheading}>Admin Sign In</h2>

            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
              maxLength={100}
              required
              placeholder="Enter username"
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
              maxLength={200}
              required
              placeholder="Enter password"
            />

            <p className={styles.signin__error}>{errorMsg}</p>

            <button type="submit" disabled={loading}>
              Sign In
            </button>
          </fieldset>
        </div>
      </form>
    </main>
  );
}
