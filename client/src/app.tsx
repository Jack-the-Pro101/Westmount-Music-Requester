import { useEffect, useState } from "preact/hooks";
import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Home } from "./routes/home/Home";
import { Error } from "./routes/error/Error";

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

  // const [searchParams] = useSearchParams();
  // const errorType = searchParams.get("code");

  return (
    <>
      <Navbar spacer={true} user={user} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/error" element={<Error errorType={errorType} CustomRender={null} />} /> */}
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}
