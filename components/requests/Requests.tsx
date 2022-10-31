import styles from "./Requests.module.css";

export default function Requests({ selectedSong }) {
  return (
    <div className={styles.requests}>
      <p>{selectedSong.title}</p>

      <h2 className={styles.requests__header}>Your requests</h2>
    </div>
  );
}
