"use client";

import "./global.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export default function RootLayout({ children, session }: { children: React.ReactNode; session: Session }) {
  return (
    <html lang="en">
      <head>
        <title>Westmount Music Requester</title>

        <meta name="author" content="Emperor of Bluegaria (Jack H.)" />
        <meta name="description" content="Automated music request system for Westmount" />

        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider session={session}>
          <Navbar spacer={true} />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
