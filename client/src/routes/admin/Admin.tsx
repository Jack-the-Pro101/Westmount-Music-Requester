import styles from "./Admin.module.css";

export function Admin() {
  return (
    <main className={styles.admin}>
      <section className={styles.admin__section}>
        <h2 className={styles.admin__heading}>User Management</h2>

        <ul className={styles.admin__actions}>
          <li className={styles.admin__action}>
            <h5>Create User</h5>

            <form action="#">
              <fieldset>
                <label htmlFor="new-email">Email or Username</label>
                <input type="email" name="new-email" id="new-email" maxLength={320} />
              </fieldset>
              <fieldset>
                <label htmlFor="">1</label>
                <input type="checkbox" name="" id="" />
                <label htmlFor="">1</label>
                <input type="checkbox" name="" id="" />
                <label htmlFor="">1</label>
                <input type="checkbox" name="" id="" />
                <label htmlFor="">1</label>
                <input type="checkbox" name="" id="" />
                <label htmlFor="">1</label>
                <input type="checkbox" name="" id="" />
              </fieldset>
              <fieldset>
                <label htmlFor="new-is-internal">Internal</label>
                <input type="checkbox" name="new-is-internal" id="new-is-internal" />
              </fieldset>
            </form>
          </li>
        </ul>
      </section>
      <section className={styles.admin__section}>
        <form action="#">
          <fieldset>
            <label htmlFor="user-search">Search Users</label>
            <input type="text" name="user-search" id="user-search" />
          </fieldset>
        </form>

        <ul className={styles["admin__users-list"]}></ul>
      </section>
    </main>
  );
}
