import "../app/global.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { SessionProvider } from "next-auth/react";

import { Inter } from "@next/font/google";
const inter = Inter();

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <div className={inter.className}>
      <SessionProvider session={session}>
        <Navbar spacer={true} />
        <Component {...pageProps} />
        <Footer />
      </SessionProvider>
    </div>
  );
}
