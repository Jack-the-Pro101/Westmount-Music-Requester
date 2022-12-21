import { useEffect, useState } from "preact/hooks";
import { BrowserRouter, NavigateFunction, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Home } from "./routes/home/Home";
import { MyRequests } from "./routes/myrequests/MyRequests";
import { Signin } from "./routes/signin/Signin";
import { Error } from "./routes/error/Error";
import { Credits } from "./routes/credits/Credits";

import { StoredUser } from "./types";
import { Requests } from "./routes/requests/Requests";
import { createContext } from "preact";
import { Help } from "./routes/help/Help";
import { Admin } from "./routes/admin/Admin";
import { BASE_URL } from "./env";
import { check } from "./shared/permissions/manager";

interface AuthContextProps {
  user?: StoredUser | null;
  login: (username: string, password: string) => Promise<StoredUser | undefined>;
  logout: (navigate: NavigateFunction) => Promise<void>;
}

async function logout(navigate: NavigateFunction) {
  const logoutRequest = await fetch(BASE_URL + "/api/auth/logout", {
    method: "DELETE",
  });

  if (logoutRequest.ok) {
    window.location.replace("/signin");
  } else {
    alert(`Failed to logout\nError ${logoutRequest.status}: ${logoutRequest.statusText}`);
  }
}

async function login(username: string, password: string) {
  const request = await fetch(BASE_URL + "/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (request.ok) return (await request.json()) as StoredUser;
}

export const AuthContext = createContext<AuthContextProps>({
  login: login,
  logout: logout,
});

const exemptedRedirecPaths = ["signin", "error"];

export function App() {
  const [user, setUser] = useState<StoredUser | null>();

  const redirectExempted = exemptedRedirecPaths.some((path) => window.location.pathname.includes(path));

  useEffect(() => {
    (async () => {
      const request = await fetch(BASE_URL + "/api/auth/session");

      if (request.ok) {
        const response = (await request.json()) as StoredUser;

        if (response) {
          if (!check(["USE_REQUESTER"], response.permissions)) return window.location.replace("/error?code=banned");
          setUser(response);

          return;
        }
      } else {
        setUser(null);
        if (!redirectExempted) {
          window.location.replace("/signin");
        }
      }
    })();
  }, []);

  return (
    <>
      <AuthContext.Provider value={{ user, login, logout }}>
        <div className={"load-block" + (user !== undefined && (user !== null || redirectExempted) ? " loading-block--loaded" : "")}>
          <img src="/images/loading2.svg" alt="Loading image" />
          <p className="load-block__text">
            {user === undefined ? "Loading" : user === null ? (redirectExempted ? "Load complete" : "Redirecting...") : "Load complete"}
          </p>
        </div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navbar spacer={false} />} />
            <Route path="/*" element={<Navbar spacer={true} />} />
          </Routes>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/myrequests" element={<MyRequests />} />
            <Route path="/help" element={<Help />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/error" element={<Error />} />
            <Route path="/*" element={<Error />} />
          </Routes>
        </BrowserRouter>
        <Footer />
      </AuthContext.Provider>
    </>
  );
}
