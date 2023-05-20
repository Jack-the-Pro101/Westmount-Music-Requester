import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { AuthContext } from "../../app";
import { check, FLAGS } from "../../shared/permissions/manager";
import { StoredUser } from "../../types";
import { anyStringIncludes } from "../../utils";
import styles from "./Admin.module.css";

const DEFAULT_CHECKED_FLAGS = [FLAGS.USE_REQUESTER];

export function Admin() {
  const [page, setPage] = useState(0);

  const [users, setUsers] = useState<StoredUser[]>([]);

  const [searchUsersQuery, setSearchUsersQuery] = useState("");

  const { user } = useContext(AuthContext);

  interface ColumnUsersSortObj {
    type: string;
    asc: boolean;
  }
  const [columnUsersSort, setUsersColumnSort] = useState<ColumnUsersSortObj>({
    type: "name",
    asc: true,
  });
  const [matchUsers, setMatchUsers] = useState("");

  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    (async () => {
      const request = await fetch("/api/admin/users/50?page=" + page);

      if (request.ok) {
        setUsers((await request.json()) as StoredUser[]);
      } else {
        alert("Failed to get users");
      }
    })();
  }, [page]);

  const createUserInputRef = useRef<HTMLInputElement>(null);
  const createUserNameRef = useRef<HTMLInputElement>(null);
  const createUserPasswordRef = useRef<HTMLInputElement>(null);
  const createUserInternalRef = useRef<HTMLInputElement>(null);

  async function createUser(e: Event) {
    e.preventDefault();

    let permissions = 0;

    const internal = createUserInternalRef.current?.checked;

    const permissionsCheckboxes: NodeListOf<HTMLInputElement> =
      document.querySelectorAll(".new-user-permissions-checkbox");
    permissionsCheckboxes.forEach((checkbox) =>
      checkbox.checked
        ? (permissions +=
            FLAGS[checkbox.dataset.flagName as keyof typeof FLAGS])
        : 0
    );

    const request = await fetch("/api/admin/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: createUserNameRef.current?.value,
        username: internal ? createUserInputRef.current?.value : null,
        password: internal ? createUserPasswordRef.current?.value : null,
        email: internal ? null : createUserInputRef.current?.value,
        type: internal ? "INTERNAL" : "GOOGLE",
        permissions,
      }),
    });

    if (request.ok) {
      setUsers([...users, (await request.json()) as StoredUser]);

      (e.target as HTMLFormElement).reset();
    } else {
      alert("Failed to create user");
    }
  }

  const editUserInputRef = useRef<HTMLInputElement>(null);
  const editUserNameRef = useRef<HTMLInputElement>(null);
  const editUserPasswordRef = useRef<HTMLInputElement>(null);
  const editUserInternalRef = useRef<HTMLInputElement>(null);

  async function editUser(e: Event) {
    e.preventDefault();

    let permissions = 0;

    const internal = editUserInternalRef.current?.checked;

    const permissionsCheckboxes: NodeListOf<HTMLInputElement> =
      document.querySelectorAll(".edit-user-permissions-checkbox");
    permissionsCheckboxes.forEach((checkbox) =>
      checkbox.checked
        ? (permissions +=
            FLAGS[checkbox.dataset.flagName as keyof typeof FLAGS])
        : 0
    );

    const userId = editingUser!._id;

    const request = await fetch("/api/admin/users/" + userId, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editUserNameRef.current?.value,
        username: internal ? editUserInputRef.current?.value : null,
        password: internal ? editUserPasswordRef.current?.value : null,
        email: internal ? null : editUserInputRef.current?.value,
        type: internal ? "INTERNAL" : "GOOGLE",
        permissions,
      }),
    });

    if (request.ok) {
      const newUser = (await request.json()) as StoredUser;
      setUsers(
        users.map((user) => {
          if (user._id !== userId) return user;
          return newUser;
        })
      );

      setEditingUser(newUser);
    } else {
      alert("Failed to create user");
    }
  }

  async function searchUsers(e: Event) {
    e.preventDefault();
    const request = await fetch(
      "/api/admin/users/search?query=" + searchUsersQuery
    );

    if (request.ok) {
      setUsers((await request.json()) as StoredUser[]);
    } else {
      alert("Failed to search users");
    }
  }

  async function dangerRecycle() {
    if (
      !confirm(
        "RE-CYCLE CONFIRMATION:\nYOU ARE ABOUT TO RE-CYCLE THE REQUESTS SYSTEM. THIS ACTION IS IRREVERSIBLE. ARE YOU SURE YOU WANT TO CONTINUE?"
      )
    )
      return;

    const recycleRequest = await fetch("/api/requests", {
      method: "DELETE",
    });

    if (recycleRequest.ok) {
      alert("Re-cycle successfully completed.");
    } else {
      alert("Failed to re-cycle requests.");
    }
  }

  return (
    <main className={styles.admin}>
      {user && (
        <>
          <div className={styles.admin__users}>
            <aside className={styles.admin__sidepanel}>
              <section className={styles.admin__section}>
                <h2 className={styles.admin__heading}>User Management</h2>

                <ul className={styles.admin__actions}>
                  <li className={styles.admin__action}>
                    <h4>Create User</h4>

                    <form
                      action="#"
                      className={styles.admin__form}
                      onSubmit={createUser}
                    >
                      <fieldset className={styles.admin__fieldset}>
                        <label htmlFor="new-name">Name</label>
                        <input
                          type="text"
                          name="new-name"
                          id="new-name"
                          maxLength={320}
                          ref={createUserNameRef}
                        />
                        <label htmlFor="new-email">Email or Username</label>
                        <input
                          type="text"
                          name="new-email"
                          id="new-email"
                          maxLength={320}
                          ref={createUserInputRef}
                        />
                        <label htmlFor="new-email">
                          Password (only internal)
                        </label>
                        <input
                          type="text"
                          name="new-password"
                          id="new-password"
                          maxLength={320}
                          ref={createUserPasswordRef}
                        />
                      </fieldset>
                      <fieldset className={styles.admin__fieldset}>
                        <h5>Permissions</h5>
                        <ul className={styles["admin__permissions-list"]}>
                          {Object.keys(FLAGS).map((flag) => {
                            return (
                              <li
                                style={
                                  "display: flex; justify-content: space-between;" +
                                  (flag.startsWith("BLANK")
                                    ? "display: none"
                                    : "")
                                }
                              >
                                <label
                                  htmlFor={flag.toLowerCase() + "_new-checkbox"}
                                >
                                  {flag}
                                </label>
                                <input
                                  type="checkbox"
                                  name={flag.toLowerCase()}
                                  className="new-user-permissions-checkbox"
                                  id={flag.toLowerCase() + "_new-checkbox"}
                                  data-flag-name={flag}
                                  checked={DEFAULT_CHECKED_FLAGS.includes(
                                    FLAGS[flag as keyof typeof FLAGS]
                                  )}
                                  disabled={
                                    flag === "ADMINISTRATOR"
                                      ? !check(
                                          ["ADMINISTRATOR"],
                                          user.permissions
                                        )
                                      : false
                                  }
                                />
                              </li>
                            );
                          })}
                        </ul>
                      </fieldset>
                      <fieldset className={styles.admin__fieldset}>
                        <label htmlFor="new-is-internal">Internal</label>
                        <input
                          type="checkbox"
                          name="new-is-internal"
                          id="new-is-internal"
                          ref={createUserInternalRef}
                        />
                      </fieldset>

                      <button type="submit">Create</button>
                    </form>
                  </li>
                  <li className={styles.admin__action}>
                    <h4>Edit User</h4>
                    <p style="text-align: center; color: hsl(var(--clr-neutral-700))">
                      {editingUser?.name}
                    </p>

                    {editingUser != null && (
                      <form
                        action="#"
                        className={styles.admin__form}
                        onSubmit={editUser}
                      >
                        <fieldset className={styles.admin__fieldset}>
                          <label htmlFor="new-name">Name</label>
                          <input
                            type="text"
                            name="new-name"
                            id="new-name"
                            maxLength={320}
                            ref={editUserNameRef}
                            value={editingUser.name}
                          />
                          <label htmlFor="edit-email">Email or Username</label>
                          <input
                            type="text"
                            name="edit-email"
                            id="edit-email"
                            maxLength={320}
                            value={editingUser.email || editingUser.username}
                            ref={editUserInputRef}
                          />
                          <label htmlFor="new-email">
                            Password (only internal, leave blank to not update)
                          </label>
                          <input
                            type="text"
                            name="new-password"
                            id="new-password"
                            maxLength={320}
                            ref={editUserPasswordRef}
                          />
                        </fieldset>
                        <fieldset className={styles.admin__fieldset}>
                          <h5>Permissions</h5>
                          <ul className={styles["admin__permissions-list"]}>
                            {Object.keys(FLAGS).map((flag) => {
                              return (
                                <li
                                  style={
                                    "display: flex; justify-content: space-between;" +
                                    (flag.startsWith("BLANK")
                                      ? "display: none"
                                      : "")
                                  }
                                >
                                  <label
                                    htmlFor={
                                      flag.toLowerCase() + "_edit-checkbox"
                                    }
                                  >
                                    {flag}
                                  </label>
                                  <input
                                    type="checkbox"
                                    name={flag.toLowerCase()}
                                    id={flag.toLowerCase() + "_edit-checkbox"}
                                    checked={check(
                                      [flag],
                                      editingUser.permissions
                                    )}
                                    className="edit-user-permissions-checkbox"
                                    data-flag-name={flag}
                                    disabled={
                                      flag === "ADMINISTRATOR"
                                        ? !check(
                                            ["ADMINISTRATOR"],
                                            user.permissions
                                          )
                                        : false
                                    }
                                  />
                                </li>
                              );
                            })}
                          </ul>
                        </fieldset>
                        <fieldset className={styles.admin__fieldset}>
                          <label htmlFor="edit-is-internal">Internal</label>
                          <input
                            type="checkbox"
                            name="edit-is-internal"
                            id="edit-is-internal"
                            checked={editingUser.type === "INTERNAL"}
                            disabled
                            ref={editUserInternalRef}
                          />
                        </fieldset>

                        <div style="display: flex; gap: 1em;">
                          <button
                            type="cancel"
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </button>
                          <button type="submit">Edit</button>
                        </div>
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
                  <input
                    type="text"
                    name="user-search"
                    id="user-search"
                    onChange={(e: Event) =>
                      setSearchUsersQuery((e.target as HTMLInputElement).value)
                    }
                  />
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
                    onChange={(e) =>
                      setMatchUsers((e.target as HTMLInputElement).value)
                    }
                  />
                </fieldset>
              </form>

              <ul className={styles["admin__users-list"]}>
                <li className={styles["admin__users-list-item"]}>
                  <button
                    onClick={() =>
                      setUsersColumnSort(
                        columnUsersSort.type === "name"
                          ? { type: "name", asc: !columnUsersSort.asc }
                          : { type: "name", asc: true }
                      )
                    }
                  >
                    Name
                    <i
                      class="fa-solid fa-caret-down"
                      style={
                        columnUsersSort.type === "name" && columnUsersSort.asc
                          ? "transform: rotate(180deg)"
                          : ""
                      }
                    ></i>
                  </button>
                  <button
                    onClick={() =>
                      setUsersColumnSort(
                        columnUsersSort.type === "username"
                          ? { type: "username", asc: !columnUsersSort.asc }
                          : { type: "username", asc: true }
                      )
                    }
                  >
                    Username/Email
                    <i
                      class="fa-solid fa-caret-down"
                      style={
                        columnUsersSort.type === "username" &&
                        columnUsersSort.asc
                          ? "transform: rotate(180deg)"
                          : ""
                      }
                    ></i>
                  </button>
                  <button
                    onClick={() =>
                      setUsersColumnSort(
                        columnUsersSort.type === "type"
                          ? { type: "type", asc: !columnUsersSort.asc }
                          : { type: "type", asc: true }
                      )
                    }
                  >
                    Type
                    <i
                      class="fa-solid fa-caret-down"
                      style={
                        columnUsersSort.type === "type" && columnUsersSort.asc
                          ? "transform: rotate(180deg)"
                          : ""
                      }
                    ></i>
                  </button>
                  <button>Permissions</button>
                  <button>Actions</button>
                </li>
                {users
                  .filter((user) =>
                    anyStringIncludes(
                      [user.name, user.email || user.username],
                      matchUsers
                    )
                  )
                  .sort((a, b) => {
                    let x =
                      a[
                        columnUsersSort.type === "username"
                          ? a.email
                            ? "email"
                            : columnUsersSort.type
                          : columnUsersSort.type
                      ].toLowerCase();
                    let y =
                      b[
                        columnUsersSort.type === "username"
                          ? b.email
                            ? "email"
                            : columnUsersSort.type
                          : columnUsersSort.type
                      ].toLowerCase();
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
              <div className={styles["admin__page-btns"]}>
                <span>Page {page + 1}</span>
                <div>
                  <button
                    style="margin-right: 0.25em"
                    title="Previous page"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 0}
                  >
                    <i class="fa-regular fa-arrow-left"></i>
                  </button>
                  <button
                    title="Next page"
                    onClick={() => setPage(page + 1)}
                    disabled={users.length === 0 || users.length !== 50}
                  >
                    <i class="fa-regular fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </section>
          </div>
          <div className={styles.admin__danger}>
            <h2 className={styles.admin__heading}>Danger Zone</h2>

            <section className={styles["admin__danger-section"]}>
              <h3 className={styles["admin__danger-heading"]}>Re-cycle</h3>

              <div className={styles["admin__danger-recycle"]}>
                <button
                  className={styles["admin__danger-recycle-btn"]}
                  onClick={dangerRecycle}
                >
                  RE-CYCLE
                </button>
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
