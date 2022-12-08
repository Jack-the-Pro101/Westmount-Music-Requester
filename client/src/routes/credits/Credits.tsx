import styles from "./Credits.module.css";

export function Credits() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Credits</h1>
      </header>
      <main className={styles.credits}>
        <section className={styles.credits__section}>
          <header className={styles.credits__header}>
            <h2 className={styles.credits__heading}>Developers</h2>
            <hr />
          </header>
          <ul className={styles.credits__list}>
            <li className={styles.credits__item}>Primary developer - Jack Huang</li>
            <li className={styles.credits__item}>
              Developer -{" "}
              <a href="https://github.com/infiniwave" target="_blank" rel="noopener noreferrer">
                @infiniwave
              </a>
            </li>
          </ul>
        </section>
        <section className={styles.credits__section}>
          <header className={styles.credits__header}>
            <h2 className={styles.credits__heading}>Contributors</h2>
            <hr />
          </header>
          <ul className={styles.credits__list}>
            <li className={styles.credits__item}>UI Design - Tanushri Sendhil Kumar</li>
            <li className={styles.credits__item}>UI Ideas - Riley Jervis</li>
            <li className={styles.credits__item}>Math - Nathan Martin</li>
          </ul>
        </section>
        <section className={styles.credits__section}>
          <header className={styles.credits__header}>
            <h2 className={styles.credits__heading}>Special Thanks</h2>
            <hr />
          </header>
          <ul className={styles.credits__list}>
            <li className={styles.credits__item}>Friend - George Zeng</li>
            <li className={styles.credits__item}>Teacher - Mr. Timofejew</li>
            <li className={styles.credits__item}>Teacher - Mr. Trink</li>
          </ul>
        </section>
      </main>
    </>
  );
}