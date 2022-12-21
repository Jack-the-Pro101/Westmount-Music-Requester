import { useContext, useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../app";
import { check } from "../shared/permissions/manager";

export function Navbar({ spacer }: { spacer: boolean }) {
  const [dropdownDropped, setDropdownDropped] = useState(false);

  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  function toggleTheme() {
    document.querySelector("html")?.classList.toggle("light");
  }

  return (
    <>
      <nav className="navbar">
        <ul className="navbar__list">
          <li className="navbar__item navbar__item--logo">
            <a href="/">
              <img src="/images/logo/logo256.webp" alt="Westmount Music Requester logo" />
            </a>
          </li>
          <li className="navbar__item navbar__item-dropdown-container">
            {user ? (
              <button className="navbar__profile" onClick={() => setDropdownDropped(!dropdownDropped)}>
                <div className="navbar__icon">
                  <img
                    src={user.type === "GOOGLE" ? user.avatar : "/images/userprofile.svg"}
                    referrerpolicy="no-referrer"
                    alt={user.name + "'s avatar"}
                    className="navbar__icon-img"
                  />
                </div>
                <p className="navbar__name">{user.name}</p>
                <i class="fa-solid fa-caret-down" style={"margin-left: 1.5rem;" + (dropdownDropped ? "transform: rotate(180deg)" : "")}></i>
              </button>
            ) : (
              <a href={"/sign-in"} className={`${user == null ? "loading" : ""}`}>
                Sign In
              </a>
            )}

            <ul className={"navbar__dropdown" + (dropdownDropped ? " navbar__dropdown--active" : "")}>
              <li className="navbar__dropdown-item">
                <a href="/my-requests">
                  <i class="fa-regular fa-ballot"></i> Your Requests
                </a>
              </li>
              {user && check(["ACCEPT_REQUESTS"], user.permissions) && (
                <li className="navbar__dropdown-item">
                  <a href="/requests">
                    <i class="fa-regular fa-list"></i> User Requests
                  </a>
                </li>
              )}
              {user && check(["ADMINISTRATOR"], user.permissions) && (
                <li className="navbar__dropdown-item">
                  <a href="/admin">
                    <i class="fa-regular fa-lock-keyhole"></i> Admin Panel
                  </a>
                </li>
              )}
              <li className="navbar__dropdown-breaker"></li>
              <li className="navbar__dropdown-item">
                <button className="navbar__dropdown-btn" onClick={() => toggleTheme()}>
                  <i class="fa-regular fa-circle-half-stroke"></i> Toggle Theme
                </button>
              </li>
              <li className="navbar__dropdown-breaker"></li>
              <li className="navbar__dropdown-item">
                <button className="navbar__dropdown-btn" onClick={() => logout(navigate)}>
                  <i class="fa-regular fa-right-from-bracket"></i> Sign Out
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <div
        className={"navbar__dropdown-blur-area" + (dropdownDropped ? " navbar__dropdown-blur-area--active" : "")}
        onClick={() => setDropdownDropped(false)}
      ></div>

      {spacer && (
        <div className="navbar-spacer" aria-hidden="true">
           
        </div>
      )}
    </>
  );
}
