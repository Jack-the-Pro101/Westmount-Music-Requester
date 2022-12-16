import { useContext, useState } from "preact/hooks";
import { AuthContext } from "../../app";
import styles from "./Signin.module.css";

export function Signin() {
  const { login } = useContext(AuthContext);

  const [adminSigninShown, setAdminSigninShown] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  let errorMsg = "";
  async function handleSignin(e: Event) {
    e.preventDefault();

    const user = await login(username, password);

    if (user) {
      window.location.replace("/");
    } else {
      errorMsg = "Username or password invalid.";
    }
  }

  return (
    <main className={styles.signin}>
      <form action="#" className={styles.signin__form} onSubmit={handleSignin}>
        <h1 className={styles.signin__heading}>Sign In</h1>

        <fieldset className={styles.signin__fieldset}>
          <a href="/api/auth" tabIndex={-1}>
            <button className={styles["signin__option-btn"]} type="button">
              Sign in with Google
            </button>
          </a>
        </fieldset>
        <p className={styles.signin__description}>Use your HWDSB account to sign in with Google.</p>

        <div style="display: flex; flex-direction: column">
          <fieldset className={styles.signin__fieldset} style="order: 2">
            <div className={styles["signin__fieldset-section"]}>
              <label htmlFor="is-admin">Admin login?</label>
              <input type="checkbox" name="is-admin" id="is-admin" onChange={() => setAdminSigninShown(!adminSigninShown)} checked={adminSigninShown} />
            </div>
          </fieldset>
          <fieldset className={styles.signin__fieldset + ` ${adminSigninShown ? "" : styles.hidden}`} style="order: 1">
            <hr />

            <h2 className={styles.signin__subheading}>Admin Sign In</h2>

            <label htmlFor="username">Username</label>
            <input type="text" name="username" id="username" value={username} onChange={(e) => setUsername((e.target as HTMLInputElement).value)} maxLength={100} required />
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} maxLength={200} required />

            <p className={styles.signin__error}>{errorMsg}</p>

            <button type="submit">Sign In</button>
          </fieldset>
        </div>
      </form>
    </main>
  );
}
