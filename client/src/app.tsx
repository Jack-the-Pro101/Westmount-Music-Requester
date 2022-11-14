import { useEffect, useState } from "preact/hooks";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Home } from "./routes/Home";

import { GoogleUser } from "./types";

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

        setUser(false);
      }
    })();
  }, []);

  return (
    <>
      <Navbar spacer={true} user={user} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}
