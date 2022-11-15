import { GoogleUser } from "../types";

export function Navbar({ spacer, user }: { spacer: boolean; user: GoogleUser | false | undefined }) {
  return (
    <>
      <nav className="navbar">
        <ul className="navbar__list">
          <li className="navbar__item navbar__item--logo">
            <img src="/images/Westmount_Secondary_School_Logo.webp" alt="Westmount logo" />
          </li>
          <li className="navbar__item">
            {user ? (
              <button className="navbar__profile">
                <div className="navbar__icon">
                  <img src={user.user.picture || ""} alt={user.user.firstName + "'s avatar"} className="navbar__icon-img" />
                </div>
                <p className="navbar__name">
                  {user.user.firstName} {user.user.lastName}
                </p>
              </button>
            ) : (
              <a href={"/api/auth"} className={`${user == null ? "loading" : ""}`}>
                Sign In
              </a>
            )}
          </li>
        </ul>
      </nav>

      {spacer ? (
        <div className="navbar-spacer" aria-hidden="true">
           
        </div>
      ) : null}
    </>
  );
}
