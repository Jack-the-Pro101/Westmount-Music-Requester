import { useEffect, useState } from "preact/hooks";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Home } from "./routes/home/Home";
import { Signin } from "./routes/signin/Signin";
import { Error } from "./routes/error/Error";
import { Credits } from "./routes/credits/Credits";

import { GoogleUser } from "./types";
import { Requests } from "./routes/requests/Requests";

export function App() {
  const [user, setUser] = useState<GoogleUser | false | undefined>();

  useEffect(() => {
    (async () => {
      const request = await fetch("/api/auth/session");

      if (request.ok) {
        const response = await request.json();

        if (response) {
          setUser(response);

          return;
        }
      } else {
        setUser(false);
      }
    })();
  }, []);

  async function logout() {
    const logoutRequest = await fetch("/api/auth/logout", {
      method: "DELETE",
    });

    if (logoutRequest.ok) {
      window.location.replace("/signin");
    } else {
      alert(`Failed to logout\nError ${logoutRequest.status}: ${logoutRequest.statusText}`);
    }
  }

  return (
    <>
      <Navbar spacer={false} logout={logout} user={user} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/error" element={<Error />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/*" element={<Error />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}
