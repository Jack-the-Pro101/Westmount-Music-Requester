import "./global.css";

import downloader from "../lib/yt-dlp/downloader";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import AuthContext from "./AuthContext";

import { Inter } from "@next/font/google";

const inter = Inter();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <title>Westmount Music Requester</title>

      <meta name="author" content="Emperor of Bluegaria (Jack H.)" />
      <meta name="description" content="Automated music request system for Westmount Secondary School" />

      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* 
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" /> */}

      <body className={inter.className}>
        <AuthContext>
          <Navbar spacer={true} />
          <>{children}</>
          <Footer />
        </AuthContext>
      </body>
    </html>
  );
}
