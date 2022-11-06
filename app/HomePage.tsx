"use client";

import { useState } from "react";

import HomeSearch from "../components/search/HomeSearch";
import Requests from "../components/requests/Requests";

import styles from "./Index.module.css";

import { CoreSong } from "../types/songtypes";

export default function Home() {
  const [selectedCoreSong, setSelectedCoreSong] = useState({});

  return (
    <div className="container">
      <header className={styles.header}>
        <h1 className={styles.header__title}>Westmount Music Requester</h1>
      </header>

      <main className={styles.main}>
        <HomeSearch setSelectedCoreSong={setSelectedCoreSong} />
        <Requests selectedCoreSong={selectedCoreSong} />
      </main>
    </div>
  );
}
