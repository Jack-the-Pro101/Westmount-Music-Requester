import styles from "./Help.module.css";

export function Help() {
  return (
    <main className={styles.help}>
      <section className={styles.help__section} id="beta">
        <h2 className={styles.help__heading}>Beta?</h2>

        <p>
          The application is currently in its beta release, meaning bugs and glitches may appear. Please report any if you find them, as your help is
          appreciated!
        </p>
      </section>
      <section className={styles.help__section} id="search">
        <h2 className={styles.help__heading}>Search Discrepancies</h2>

        <p>
          Can't find the track you selected from the search bar in sources? This is because the search uses Spotify's search API to find tracks, whilst the
          sources search YouTube Music to find its tracks. Unfortunately, this means that there may be tracks on Spotify that are not on YouTube. See more
          information on why this implementation is used <a href="#howitworks">below</a>.
        </p>
      </section>
      <section className={styles.help__section} id="howitworks">
        <h2 className={styles.help__heading}>How Does It Work?</h2>

        <ol className={styles.help__how}>
          <li className={styles["help__how-item"]}>
            <p>Your search query is fetched from Spotify's search API. Songs pre-marked as explicit are filtered out automatically.</p>
          </li>
          <li className={styles["help__how-item"]}>
            <p>
              Once a song is selected, YouTube Music is searched to retrieve a downloadable source instead of downloading from Spotify. This is due to Spotify
              placing strict copyright safeguards in their system which prevents songs from being downloaded effectively. However, Spotify has a more suitable
              API (Application Programming Interface) for searching songs, which is why Spotify is used to search.
            </p>
          </li>
          <li className={styles["help__how-item"]}>
            <p>
              YouTube Music returns sources which can be previewed in the play range selector. The selector plays audio directly from the deciphered YouTube
              audio source.
            </p>
          </li>
          <li className={styles["help__how-item"]}>
            <p>
              As soon as the "request" button is pressed, a request is made on the server database. Then, the server begins going through verification processes
              which include verifying request information to prevent forged requests, scanning lyrics for potential profane lines in the song, and finally
              scanning the possible lines with AI.
            </p>
          </li>
          <li className={styles["help__how-item"]}>
            <p>If a song passes profanity checks, it awaits the final confirmation from a human. Otherwise, the song is automatically rejected.</p>
          </li>
          <li className={styles["help__how-item"]}>
            <p>
              When a song is accepted by a human, the request is marked as accepted and then begins download of the song in preparation for playback on the PA
              system.
            </p>
          </li>
        </ol>
      </section>
      <section className={styles.help__section} id="statuses">
        <h2 className={styles.help__heading}>
          Request Statuses
          <a href="#statuses" className={styles.help__anchor}>
            #
          </a>
        </h2>

        <ul className={styles["help__statuses-list"]}>
          <li className={styles["help_statuses-item"]}>
            <p>Awaiting</p>
            <p>Song is awaiting automated profanity check before continuing.</p>
          </li>
          <li className={styles["help_statuses-item"]}>
            <p>Auto Rejected</p>
            <p>Song has confidently been detected to contain profanity and has been rejected by the AI.</p>
          </li>
          <li className={styles["help_statuses-item"]}>
            <p>Pending Manual</p>
            <p>
              No lyrics could be found for the song, either because it is an instrumental or that YouTube Music does not have the lyrics. Usually, Spotify will
              have the lyrics if YouTube Music does not, but lyrics from Spotify cannot be fetched automatically. Therefore, a manual human effort is being
              awaited to verify.
            </p>
          </li>
          <li className={styles["help_statuses-item"]}>
            <p>Pending</p>
            <p>Song has passed profanity check and is awaiting human verification.</p>
          </li>
          <li className={styles["help_statuses-item"]}>
            <p>Rejected</p>
            <p>A human verifier has rejected the song. This could be due to many reasons.</p>
          </li>
          <li className={styles["help_statuses-item"]}>
            <p>Accepted</p>
            <p>Song has been accepted by a human and is ready to play.</p>
          </li>
        </ul>
      </section>
    </main>
  );
}
