import { useEffect, useRef, useState } from "preact/hooks";
import { check, FLAGS } from "../../shared/permissions/manager";
import { StoredUser } from "../../types";
import { anyStringIncludes } from "../../utils";
import styles from "./Admin.module.css";

const DEFAULT_CHECKED_FLAGS = [FLAGS.USE_REQUESTER];

export function Admin() {
  const [createFlags, setCreateFlags] = useState([]);

  const [users, setUsers] = useState<StoredUser[]>([]);

  const [searchUsersQuery, setSearchUsersQuery] = useState("");

  interface ColumnUsersSortObj {
    type: string;
    asc: boolean;
  }
  const [columnUsersSort, setUsersColumnSort] = useState<ColumnUsersSortObj>({ type: "name", asc: true });
  const [matchUsers, setMatchUsers] = useState("");

  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);

  function addFlagToState(flag: number) {
    if (createFlags.includes(flag)) return;
    setCreateFlags([...createFlags, flag]);
  }

  useEffect(() => {
    (async () => {
      const request = await fetch("/api/admin/users/50");

      if (request.ok) {
        setUsers((await request.json()) as StoredUser[]);
      }
    })();
  }, []);

  const createUserInputRef = useRef<HTMLInputElement>(null);
  const createUserNameRef = useRef<HTMLInputElement>(null);
  const createUserInternalRef = useRef<HTMLInputElement>(null);

  async function createUser(e: Event) {
    e.preventDefault();

    const permissions: number[] = [];

    const internal = createUserInternalRef.current?.checked;

    const permissionsCheckboxes = document.querySelectorAll(".new-user-permissions-checkbox");
    permissionsCheckboxes.forEach((checkbox) => permissions.push(FLAGS[checkbox.dataset!["flag-name"]]));

    console.log({
      name: createUserNameRef.current?.value,
      username: internal ? createUserInputRef.current?.value : null,
      email: internal ? null : createUserInputRef.current?.value,
      internal,
      permissions,
    });

    return;

    const request = await fetch("/api/admin/users/", {
      method: "POST",
      // body: JSON.stringify(),
    });

    if (request.ok) {
      setUsers([...users, (await request.json()) as StoredUser]);
    }
  }

  async function editUser(e: Event) {
    e.preventDefault();
  }

  async function searchUsers(e: Event) {
    e.preventDefault();
    const request = await fetch("/api/admin/users/search?query=" + searchUsersQuery);

    if (request.ok) {
      setUsers((await request.json()) as StoredUser[]);
    }
  }

  return (
    <main className={styles.admin}>
      <div className={styles.admin__users}>
        <aside className={styles.admin__sidepanel}>
          <section className={styles.admin__section}>
            <h2 className={styles.admin__heading}>User Management</h2>

            <ul className={styles.admin__actions}>
              <li className={styles.admin__action}>
                <h4>Create User</h4>

                <form action="#" className={styles.admin__form} onSubmit={createUser}>
                  <fieldset className={styles.admin__fieldset}>
                    <label htmlFor="new-name">Name</label>
                    <input type="text" name="new-name" id="new-name" maxLength={320} ref={createUserNameRef} />
                    <label htmlFor="new-email">Email or Username</label>
                    <input type="text" name="new-email" id="new-email" maxLength={320} ref={createUserInputRef} />
                  </fieldset>
                  <fieldset className={styles.admin__fieldset}>
                    <h5>Permissions</h5>
                    <ul className={styles["admin__permissions-list"]}>
                      {Object.keys(FLAGS).map((flag) => {
                        if (flag.startsWith("BLANK")) return;

                        return (
                          <li style="display: flex; justify-content: space-between">
                            <label htmlFor={flag.toLowerCase() + "_new-checkbox"}>{flag}</label>
                            <input
                              type="checkbox"
                              name={flag.toLowerCase()}
                              className="new-user-permissions-checkbox"
                              id={flag.toLowerCase() + "_new-checkbox"}
                              data-flag-name={flag}
                              checked={DEFAULT_CHECKED_FLAGS.includes(FLAGS[flag])}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </fieldset>
                  <fieldset className={styles.admin__fieldset}>
                    <label htmlFor="new-is-internal">Internal</label>
                    <input type="checkbox" name="new-is-internal" id="new-is-internal" ref={createUserInternalRef} />
                  </fieldset>

                  <button type="submit">Create</button>
                </form>
              </li>
              <li className={styles.admin__action}>
                <h4>Edit User</h4>
                <p>{editingUser?.name}</p>

                {editingUser != null && (
                  <form action="#" className={styles.admin__form} onSubmit={editUser}>
                    <fieldset className={styles.admin__fieldset}>
                      <label htmlFor="edit-email">Email or Username</label>
                      <input type="text" name="edit-email" id="edit-email" maxLength={320} value={editingUser.email || editingUser.username} />
                    </fieldset>
                    <fieldset className={styles.admin__fieldset}>
                      <h5>Permissions</h5>
                      <ul className={styles["admin__permissions-list"]}>
                        {Object.keys(FLAGS).map((flag) => {
                          if (flag.startsWith("BLANK")) return;

                          return (
                            <li style="display: flex; justify-content: space-between">
                              <label htmlFor={flag.toLowerCase() + "_edit-checkbox"}>{flag}</label>
                              <input
                                type="checkbox"
                                name={flag.toLowerCase()}
                                id={flag.toLowerCase() + "_edit-checkbox"}
                                checked={check([flag], editingUser.permissions)}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </fieldset>
                    <fieldset className={styles.admin__fieldset}>
                      <label htmlFor="edit-is-internal">Internal</label>
                      <input type="checkbox" name="edit-is-internal" id="edit-is-internal" checked={editingUser.type === "INTERNAL"} />
                    </fieldset>

                    <button type="cancel" onClick={() => setEditingUser(null)}>
                      Cancel
                    </button>
                    <button type="submit">Edit</button>
                  </form>
                )}
              </li>
            </ul>
          </section>
        </aside>
        <section className={styles.admin__section}>
          <form action="#" className={styles["admin__users-search"]}>
            <fieldset>
              <label htmlFor="user-search">Search Users</label>
              <input type="text" name="user-search" id="user-search" onChange={(e: Event) => setSearchUsersQuery((e.target as HTMLInputElement).value)} />
              <button type="submit" onClick={(e) => searchUsers(e)}>
                Search
              </button>
            </fieldset>
            <fieldset>
              <label htmlFor="user-search-filter-text">Match Query</label>
              <input
                type="text"
                name="user-search-filter-text"
                id="user-search-filter-text"
                value={matchUsers}
                onChange={(e) => setMatchUsers((e.target as HTMLInputElement).value)}
              />
            </fieldset>
          </form>

          <ul className={styles["admin__users-list"]}>
            <li className={styles["admin__users-list-item"]}>
              <button
                onClick={() => setUsersColumnSort(columnUsersSort.type === "name" ? { type: "name", asc: !columnUsersSort.asc } : { type: "name", asc: true })}
              >
                Name
                <i class="fa-solid fa-caret-down" style={columnUsersSort.type === "name" && columnUsersSort.asc ? "transform: rotate(180deg)" : ""}></i>
              </button>
              <button
                onClick={() =>
                  setUsersColumnSort(columnUsersSort.type === "username" ? { type: "username", asc: !columnUsersSort.asc } : { type: "username", asc: true })
                }
              >
                Username/Email
                <i class="fa-solid fa-caret-down" style={columnUsersSort.type === "username" && columnUsersSort.asc ? "transform: rotate(180deg)" : ""}></i>
              </button>
              <button
                onClick={() => setUsersColumnSort(columnUsersSort.type === "type" ? { type: "type", asc: !columnUsersSort.asc } : { type: "type", asc: true })}
              >
                Type
                <i class="fa-solid fa-caret-down" style={columnUsersSort.type === "type" && columnUsersSort.asc ? "transform: rotate(180deg)" : ""}></i>
              </button>
              <button>Permissions</button>
              <button>Actions</button>
            </li>
            {users
              .filter((user) => anyStringIncludes([user.name, user.email || user.username], matchUsers))
              .sort((a, b) => {
                let x = a[columnUsersSort.type === "username" ? (a.email ? "email" : columnUsersSort.type) : columnUsersSort.type].toLowerCase();
                let y = b[columnUsersSort.type === "username" ? (b.email ? "email" : columnUsersSort.type) : columnUsersSort.type].toLowerCase();
                if (columnUsersSort.asc) {
                  if (x < y) {
                    return -1;
                  }
                  if (x > y) {
                    return 1;
                  }
                } else {
                  if (x < y) {
                    return 1;
                  }
                  if (x > y) {
                    return -1;
                  }
                }

                return 0;
              })
              .map((user) => (
                <li className={styles["admin__users-list-item"]}>
                  <p>{user.name}</p>
                  <p>{user.email || user.username}</p>
                  <p>{user.type}</p>
                  <p>{user.permissions}</p>
                  <button onClick={() => setEditingUser(user)}>
                    <i class="fa-regular fa-pen"></i>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      </div>
      <div className={styles.admin__danger}>
        <h2 className={styles.admin__heading}>Danger Zone</h2>
      </div>
    </main>
  );
}
