import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar({ spacer }: { spacer: boolean }) {
  const { data: session } = useSession();

  return (
    <>
      <nav className="navbar">
        <ul className="navbar__list">
          <li className="navbar__item"></li>
          <li className="navbar__item">
            {session ? (
              <button className="navbar__profile">
                <div className="navbar__icon">
                  <img src={session.user?.image || ""} alt={session.user?.name + "'s avatar"} className="navbar__icon-img" />
                </div>
                <p className="navbar__name">{session.user?.name}</p>
              </button>
            ) : (
              // <a href="/login">Sign In</a>
              <Link href={"/login"}>Sign In</Link>
            )}
          </li>
        </ul>
      </nav>

      {spacer ? <div className="navbar-spacer"> </div> : null}
    </>
  );
}
